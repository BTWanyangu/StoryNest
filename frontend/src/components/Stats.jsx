import { Star, BookOpen, Shield, Brain } from "lucide-react";

const stats = [
  {
    id: 1,
    value: "300+",
    label: "Happy Readers",
    icon: Star,
  },
  {
    id: 2,
    value: "5,000+",
    label: "Stories Created",
    icon: BookOpen,
  },
  {
    id: 3,
    value: "98%",
    label: "Parent Satisfaction",
    icon: Shield,
  },
  {
    id: 4,
    value: "0.4/5",
    label: "Average Rating",
    icon: Brain,
  },
];

export default function Stats() {
  return (
    <section className="w-full py-14 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.id}
                className="flex items-center gap-5 rounded-3xl bg-white px-6 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-slate-100"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 shrink-0">
                  <Icon className="h-8 w-8 text-indigo-600" strokeWidth={2} />
                </div>

                <div>
                  <h3 className="text-4xl font-bold leading-none text-indigo-600">
                    {stat.value}
                  </h3>
                  <p className="mt-2 text-[1.7rem] leading-none text-slate-500">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}