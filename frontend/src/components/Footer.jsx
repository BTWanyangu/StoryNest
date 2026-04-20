import { Heart, BookOpen, PlaySquare } from "lucide-react";

const quickLinks = [
  { name: "Parent Login", href: "#" },
  { name: "Child Login", href: "#" },
  { name: "Features", href: "#" },
  { name: "Pricing", href: "#" },
];

const supportLinks = [
  { name: "Help Center", href: "#" },
  { name: "Safety Guide", href: "#" },
  { name: "Parent Resources", href: "#" },
  { name: "Contact Us", href: "#" },
];

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
    title: "Interactive Learning",
    subtitle: "Engaging multimedia content",
    icon: PlaySquare,
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-night text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10 lg:px-12 xl:px-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="StoryNestAI logo"
                className="h-12 w-auto object-contain"
              />
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                <span className="text-white">Story</span>
                <span className="text-indigo-400">Nest</span>

              </h2>
            </div>

            <p className="mt-8 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Empowering children to create and explore magical stories through
              the power of AI. Join us in making reading and storytelling an
              unforgettable adventure.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white md:text-2xl">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-base text-slate-200 transition hover:text-indigo-300 md:text-lg"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white md:text-2xl">
              Support
            </h3>

            <ul className="mt-6 space-y-4">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-base text-slate-200 transition hover:text-indigo-300 md:text-lg"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <div className="grid gap-8 md:grid-cols-3">
            {featureHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-950/70">
                    <Icon className="h-7 w-7 text-indigo-300" strokeWidth={2} />
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white md:text-xl">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-300 md:text-base">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-5 text-slate-300 md:flex-row md:items-center md:justify-between">
            <p className="text-sm md:text-base">
              © 2026 StoryNest. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-4 md:gap-8">
              <a href="#" className="text-sm transition hover:text-indigo-300 md:text-base">
                Terms of Service
              </a>
              <a href="#" className="text-sm transition hover:text-indigo-300 md:text-base">
                Privacy Policy
              </a>
              <a href="#" className="text-sm transition hover:text-indigo-300 md:text-base">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}