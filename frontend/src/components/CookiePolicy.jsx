import { Cookie, Shield, CircleHelp } from "lucide-react";

export default function CookiePolicy() {
  return (
    <section className="min-h-screen w-full bg-card px-4 py-10 md:px-6 md:py-14 rounded-2xl border border-moon">
      <div className="mx-auto max-w-3xl">
        
        {/* Header */}
        <div className="rounded-2xl bg-card px-6 py-6 md:px-8">
          <div className="flex items-center gap-2 justify-center text-moon">
            <Cookie className="h-5 w-5" />
            <h1 className="text-2xl font-bold text-moon md:text-3xl">
              Cookie Policy
            </h1>
          </div>
          <p className="mt-2 text-sm text-moon md:text-base text-center">
            How we use cookies to improve your experience on Moonspun.
          </p>
        </div>

        {/* Content */}
        <div className="mt-10 space-y-12">

          {/* Intro */}
          <section>
            <div className="flex items-center gap-2 text-moon">
              <Shield className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                What Are Cookies?
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white md:text-base">
              Cookies are small data files stored on your device when you visit a
              website. They help websites function properly, remember your
              preferences, and provide useful insights to improve your
              experience.
            </p>
          </section>

          {/* Usage */}
          <section>
            <div className="flex items-center gap-2 text-moon">
              <Cookie className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                Why We Use Cookies
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white md:text-base">
              Moonspun uses cookies to:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white md:text-base">
              <li>Keep the website running smoothly</li>
              <li>Remember your preferences and settings</li>
              <li>Improve performance and user experience</li>
              <li>Analyze how our platform is used</li>
            </ul>
          </section>

          {/* Types */}
          <section>
            <div className="flex items-center gap-2 text-moon">
              <Shield className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                Types of Cookies We Use
              </h2>
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white md:text-base">
              <li>
                <strong>Essential Cookies:</strong> Required for the website to
                function properly.
              </li>
              <li>
                <strong>Performance Cookies:</strong> Help us understand how users
                interact with Moonspun.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your preferences
                and settings.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us improve the platform
                through usage insights.
              </li>
            </ul>
          </section>

          {/* Control */}
          <section>
            <div className="flex items-center gap-2 text-moon">
              <Cookie className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                How You Can Control Cookies
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white md:text-base">
              You have full control over how cookies are used. You can:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white md:text-base">
              <li>Accept or reject cookies via our cookie banner</li>
              <li>Adjust your browser settings to block cookies</li>
              <li>Delete cookies already stored on your device</li>
            </ul>
            <p className="mt-3 text-sm text-white">
              Please note that disabling cookies may affect some features of the
              website.
            </p>
          </section>

          {/* Updates */}
          <section>
            <div className="flex items-center gap-2 text-moon">
              <Shield className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                Policy Updates
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white md:text-base">
              We may update this Cookie Policy from time to time to reflect
              changes in technology, legal requirements, or how we operate
              Moonspun. We encourage you to review this page periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 text-moon">
              <CircleHelp className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                Questions About Cookies?
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white md:text-base">
              If you have any questions about our use of cookies, you can contact
              us:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white md:text-base">
              <li>
                Email:{" "}
                <a
                  href="mailto:support@moon-spun.com"
                  className="text-indigo-500 underline underline-offset-4"
                >
                  support@moon-spun.com
                </a>
              </li>
            </ul>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-14 border-t border-slate-200 pt-8 text-center">
          <p className="text-xs text-moon md:text-sm">
            Last updated: January 2026
          </p>
          <p className="mt-2 text-xs text-moon md:text-sm">
            We use cookies responsibly to improve your experience.
          </p>
        </div>

      </div>
    </section>
  );
}