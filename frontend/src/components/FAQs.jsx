import { useState } from "react";
import { ChevronDown } from "lucide-react";

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

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full border-t border-violet-100 bg-gradient-to-b from to-white px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="inline-flex items-center rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-600">
            Frequently Asked Questions
          </div>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-moon md:text-6xl">
            Got Questions?
          </h2>

          <h3 className="mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
            We&apos;ve Got Answers
          </h3>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-purple-500 md:text-xl">
            Everything you need to know about the platform, how it works, and
            how families can get the best storytelling experience.
          </p>
        </div>

        <div className="mt-14 rounded-[2rem] border border-moon bg-card p-4 shadow-[0_20px_60px_rgba(139,92,246,0.08)] backdrop-blur-sm md:p-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-card bg-card shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left md:px-8 md:py-6"
                  >
                    <span className="text-lg font-semibold text-moon md:text-[1.35rem]">
                      {faq.question}
                    </span>

                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50">
                      <ChevronDown
                        className={`h-5 w-5 text-violet-600 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-card px-6 py-5 text-base leading-8 text-white md:px-8 md:text-lg">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 md:text-base">
          <span>Quick answers for parents</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:block" />
          <span>Safe, simple, and personalized</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:block" />
          <span>Built for a real product experience</span>
        </div>
      </div>
    </section>
  );
}