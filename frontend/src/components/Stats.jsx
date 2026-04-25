import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Star, BookOpen, Shield, Brain } from "lucide-react";

const stats = [
  {
    id: 1,
    value: 5000,
    suffix: "+",
    label: "Happy Readers",
    icon: Star,
  },
  {
    id: 2,
    value: 30000,
    suffix: "+",
    label: "Stories Created",
    icon: BookOpen,
  },
  {
    id: 3,
    value: 98,
    suffix: "%",
    label: "Parent Satisfaction",
    icon: Shield,
  },
  {
    id: 4,
    value: 4.8,
    suffix: "/5",
    label: "Average Rating",
    icon: Brain,
    decimals: 1,
  },
];

function CountUpNumber({ value, suffix = "", decimals = 0, startCounting }) {
  const [displayValue, setDisplayValue] = useState(0);
  const nodeRef = useRef(null);

  useEffect(() => {
    if (!startCounting) return;

    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate(latest) {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [value, startCounting]);

  const formattedValue =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.floor(displayValue).toLocaleString();

  return <span ref={nodeRef}>{formattedValue}{suffix}</span>;
}

export default function Stats() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section ref={sectionRef} className="w-full py-14 px-4">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.id}
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.7,
                      ease: "easeOut",
                    },
                  },
                }}
                whileHover={{
                  scale: 1.06,
                  y: -6,
                  transition: { duration: 0.25 },
                }}
                className="flex items-center gap-5 rounded-3xl bg-card px-6 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-moon cursor-pointer"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={
                    isInView
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.8, opacity: 0 }
                  }
                  transition={{ duration: 0.5, delay: stat.id * 0.12 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 shrink-0"
                >
                  <Icon className="h-8 w-8 text-moon" strokeWidth={2} />
                </motion.div>

                <div>
                  <h3 className="text-4xl font-bold leading-none text-moon">
                    <CountUpNumber
                      value={stat.value}
                      suffix={stat.suffix}
                      decimals={stat.decimals || 0}
                      startCounting={isInView}
                    />
                  </h3>
                  <p className="mt-2 text-[1.7rem] leading-none text-purple-500">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}