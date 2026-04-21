import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Pause, Play, Quote, Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Parent of two",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    text: `Moonspun has transformed our bedtime routine! My kids are so excited to create their own stories, and I love how it adapts to their reading levels. The AI-generated content is incredibly engaging and educational.`,
  },
  {
    id: 2,
    name: "David L.",
    role: "Elementary Teacher",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    text: `As an educator, I'm amazed by how Moonspun combines creativity with learning. The AI-generated stories are not only entertaining but also help develop critical thinking and reading comprehension skills.`,
  },
  {
    id: 3,
    name: "Emily R.",
    role: "Mom of three",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
    text: `The personalization features are incredible! Each of my children has their own unique reading journey, and they love being able to influence their stories. The audio narration and images make it even more immersive.`,
  },
  {
    id: 4,
    name: "Jessica T.",
    role: "Homeschool Parent",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&auto=format&fit=crop&q=80",
    text: `This platform has made learning at home so much more joyful. My daughter actually asks for reading time now, and I can see her confidence growing with every new story she creates.`,
  },
  {
    id: 5,
    name: "Michael B.",
    role: "Father of one",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    text: `I was surprised by how thoughtful and creative the stories are. Moonspun gives my son stories he connects with personally, and that has made a huge difference in his reading habits.`,
  },
  {
    id: 6,
    name: "Olivia K.",
    role: "Literacy Coach",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    text: `Moonspun is one of the most exciting reading tools I’ve seen. It blends imagination, reading practice, and technology beautifully. Children stay engaged while still building real literacy skills.`,
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
      className="group w-[320px] sm:w-[360px] lg:w-[400px] shrink-0 rounded-3xl border border-moon bg-card p-7 shadow-[0_14px_30px_rgba(139,92,246,0.10)] transition-all duration-300 hover:border-violet-400 hover:shadow-[0_22px_45px_rgba(139,92,246,0.18)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-1 text-yellow-400">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className="h-5 w-5 fill-current"
              strokeWidth={1.5}
            />
          ))}
        </div>

        <motion.div
          whileHover={{ scale: 1.12, rotate: 8 }}
          transition={{ duration: 0.2 }}
        >
          <Quote className="h-8 w-8 text-violet-200" />
        </motion.div>
      </div>

      <p className="mt-6 text-lg leading-8 text-white">{review.text}</p>

      <div className="mt-8 flex items-center gap-4">
        <motion.img
          whileHover={{ scale: 1.08 }}
          src={review.image}
          alt={review.name}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-violet-200/40"
        />

        <div>
          <h4 className="text-lg font-semibold text-white">{review.name}</h4>
          <p className="text-sm text-slate-500">{review.role}</p>
        </div>
      </div>
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
            Stories from Our
          </h2>

          <h3 className="mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-6xl">
            Happy Readers
          </h3>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-purple-500 md:text-xl">
            Join thousands of satisfied families who are making reading an
            exciting adventure with Moonspun.
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

            <motion.div
              className="flex w-max gap-6"
              animate={
                isPaused
                  ? { x: undefined }
                  : { x: ["0%", "-50%"] }
              }
              transition={{
                duration: 28,
                ease: "linear",
                repeat: Infinity,
              }}
              style={{
                animationPlayState: isPaused ? "paused" : "running",
              }}
            >
              {beltReviews.map((review, index) => (
                <ReviewCard
                  key={`${review.id}-${index}`}
                  review={review}
                />
              ))}
            </motion.div>
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
            <span>2,000+ Stories Generated</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2 text-base md:text-lg"
          >
            <Quote className="h-5 w-5 text-violet-600" />
            <span>100+ Happy Families</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}