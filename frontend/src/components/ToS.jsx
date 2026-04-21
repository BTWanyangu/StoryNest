import { Shield, Heart, Users, Lock, MessageCircle } from "lucide-react";

export default function ToS() {
  return (
    <section className="min-h-screen w-full bg-card px-4 py-8 md:px-6 md:py-12 rounded-2xl border border-moon">
      <div className="mx-auto max-w-4xl">
        {/* Header Card */}
        <div className="rounded-2xl bg-card px-6 py-5 text-white md:px-8">
          <div className="flex items-start gap-3">
            <div>
              <div className="flex items-center gap-2 justify-center text-moon">
            <Shield className="h-5 w-5" />
            <h1 className="text-2xl font-bold text-moon md:text-3xl">Term of Services</h1>
          </div>
              <p className="mt-1 text-sm text-moon md:text-base justify-content-center text-center">
                Welcome to Moonspun! Here&apos;s how we can work together to
                create magical stories.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-10 space-y-10 rounded-2xl bg-card px-6 py-8 shadow-sm md:px-10">
          {/* Section 1 */}
          <div className="flex gap-4">
            <Heart className="mt-1 h-5 w-5 shrink-0 text-moon" />
            <div>
              <h2 className="text-lg font-semibold text-moon">
                Welcome to Our Story World!
              </h2>
              <p className="mt-2 text-sm leading-7 text-white md:text-base">
                Moonspun is a special place where children can create and
                read amazing stories. By using our service, you and your parents
                agree to these child-friendly terms.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex gap-4">
            <Users className="mt-1 h-5 w-5 shrink-0 text-moon" />
            <div>
              <h2 className="text-lg font-semibold text-moon">
                Using Moonspun
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-white md:text-base">
                <li>• You need a parent or guardian&apos;s permission to use Moonspun.</li>
                <li>• Be kind and respectful when creating stories.</li>
                <li>• Don&apos;t share personal information in your stories.</li>
                <li>• Have fun and be creative!</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex gap-4">
            <Users className="mt-1 h-5 w-5 shrink-0 text-moon" />
            <div>
              <h2 className="text-lg font-semibold text-moon">
                Parent/Guardian Agreement
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-white md:text-base">
                <li>• Parents must create and manage accounts for children under 13.</li>
                <li>• Parents are responsible for monitoring their child&apos;s activity.</li>
                <li>• Parents can control privacy settings and content access.</li>
                <li>• We comply with COPPA guidelines for child safety.</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="flex gap-4">
            <Lock className="mt-1 h-5 w-5 shrink-0 text-moon" />
            <div>
              <h2 className="text-lg font-semibold text-moon">Safety First!</h2>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-white md:text-base">
                <li>• We use special technology to keep stories safe and appropriate.</li>
                <li>• We protect your privacy and personal information.</li>
                <li>• We don&apos;t share your information without parent permission.</li>
                <li>• Report anything that makes you uncomfortable.</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="flex gap-4">
            <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-moon" />
            <div>
              <h2 className="text-lg font-semibold text-moon">Need Help?</h2>
              <p className="mt-2 text-sm leading-7 text-white md:text-base">
                If you have questions or need help, ask a parent to:
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-white md:text-base">
                <li>• Email us at support@moonspun.com</li>
                <li>• Visit our Help Center</li>
                <li>• Read our Privacy Policy</li>
              </ul>
            </div>
          </div>

          {/* Footer text */}
          <div className="border-t border-slate-200 pt-6 text-center">
            <p className="text-xs text-moon">Last updated: April 2026</p>
            <p className="mt-2 text-xs text-moon md:text-sm">
              By using MoonSpun, you and your parent/guardian agree to these
              terms.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}