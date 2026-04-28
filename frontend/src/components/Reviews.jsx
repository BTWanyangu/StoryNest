import { useRef, useState, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { BookOpen, Pause, Play, Quote, Star } from "lucide-react";

const reviews = [/* KEEP YOUR SAME DATA */];

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
              <Star key={index} className="h-5 w-5 fill-current" strokeWidth={1.5} />
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
            </div>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.12, rotate: 8 }}
          transition={{ duration: 0.2 }}
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
  const controls = useAnimation();

  const beltReviews = [...reviews, ...reviews];

  useEffect(() => {
    if (!isPaused) {
      controls.start({
        x: ["0%", "-50%"],
        transition: {
          duration: 100,
          ease: "linear",
          repeat: Infinity,
        },
      });
    } else {
      controls.stop(); // 🔥 THIS preserves current position
    }
  }, [isPaused, controls]);

  return (
    <section ref={sectionRef} className="w-full overflow-hidden px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-600">
            <Star className="h-4 w-4" />
            Trusted by Thousands of Families
          </div>

          <h2 className="mt-8 text-4xl font-bold text-moon md:text-6xl">
            Reviews from Our
          </h2>

          <h3 className="mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
            Happy Readers
          </h3>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-purple-500 md:text-xl">
            Join thousands of satisfied families who are making the switch to Moonspun.
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

            <motion.div className="flex w-max gap-6" animate={controls}>
              {beltReviews.map((review, index) => (
                <ReviewCard key={`${review.id}-${index}`} review={review} />
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="mt-14 flex flex-wrap justify-center gap-8 text-slate-600">
          <div className="flex items-center gap-2 text-base md:text-lg">
            <BookOpen className="h-5 w-5 text-violet-600" />
            <span className="text-white">30,000+ Stories Generated</span>
          </div>

          <div className="flex items-center gap-2 text-base md:text-lg">
            <Quote className="h-5 w-5 text-violet-600" />
            <span className="text-white">5,000+ Happy Families</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}