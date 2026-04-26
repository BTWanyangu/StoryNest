import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Can parents create stories in their own account?",
    answer:
      "Yes. Parents can create and manage stories directly from their account, personalize them for their children, and save them for later reading.",
  },
  {
    question: "How does the platform generate stories?",
    answer:
      "The platform uses AI to create personalized stories based on the child’s name, age, interests, themes, and other details provided by the parent.",
  },
  {
    question: "Is it safe for children?",
    answer:
      "Yes. The experience is designed to be family-friendly, with content controls and a focus on age-appropriate storytelling.",
  },
  {
    question: "What age group is it suitable for?",
    answer:
      "It is suitable for young children and early readers, but stories can also be tailored for different age ranges depending on the platform settings.",
  },
  {
    question: "Can multiple children be connected to one parent account?",
    answer:
      "Yes. One parent account can manage multiple child profiles, making it easy to personalize stories for each child.",
  },
];

const bottomTexts = [
  "Simple enough for any parent ",
  "Safe enough for any child",
  "Magical enough to remember forever",
];

function TypedText({ text, delay = 0 }) {
  return (
    <motion.span
      className="inline-block"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.03,
            delayChildren: delay,
          },
        },
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          className="inline-block whitespace-pre"
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.2 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full border-t border-violet-100 bg-gradient-to-b from to-white px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-600"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4 }}
          >
            Frequently Asked Questions
          </motion.div>

          <motion.h2
            className="mt-6 text-4xl font-bold tracking-tight text-moon md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Got Questions?
          </motion.h2>

          <motion.h3
            className="mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-4xl font-bold text-transparent md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We&apos;ve Got Answers
          </motion.h3>

          <motion.p
            className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-purple-500 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Everything you need to know about the platform, how it works, and
            how families can get the best storytelling experience.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-14 rounded-[2rem] border border-moon bg-card p-4 shadow-[0_20px_60px_rgba(139,92,246,0.08)] backdrop-blur-sm md:p-6"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <motion.div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-card bg-card shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left md:px-8 md:py-6"
                  >
                    <span className="text-lg font-semibold text-moon md:text-[1.35rem]">
                      {faq.question}
                    </span>

                    <motion.span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-5 w-5 text-violet-600" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          className="border-t border-card px-6 py-5 text-base leading-8 text-white md:px-8 md:text-lg"
                          initial={{ y: -8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -8, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {faq.answer}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 md:text-base"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          {bottomTexts.map((text, index) => (
            <div key={text} className="flex items-center gap-8">
              <span className="text-base md:text-lg">
                <TypedText text={text} delay={index * 0.35} />
              </span>

              {index !== bottomTexts.length - 1 && (
                <motion.span
                  className="hidden h-1 w-1 rounded-full bg-slate-300 md:block"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.25, delay: 0.4 + index * 0.2 }}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}