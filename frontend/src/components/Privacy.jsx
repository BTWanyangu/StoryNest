import { Bell, Lock, Shield, Sparkles, CircleHelp } from "lucide-react";
import { useState } from "react";
import ToS from "./ToS";
export default function Privacy() {
  return (
    <section className="min-h-screen w-full bg-card px-4 py-10 md:px-6 md:py-14 rounded-2xl border border-moon">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-card px-6 py-6 md:px-8">
          <div className="flex items-center gap-2 justify-center text-moon">
            <Shield className="h-5 w-5" />
            <h1 className="text-2xl font-bold text-moon md:text-3xl">Privacy Policy</h1>
          </div>
          <p className="mt-2 text-sm text-moon md:text-base justify-content-center text-center">
            Keeping your information safe and secure is our top priority.
          </p>
        </div>

        <div className="mt-10 space-y-12">
          <section>
            <div className="flex items-center gap-2 text-moon">
              <Shield className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                Your Privacy Matters
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white md:text-base">
              We want you to feel safe while creating and reading stories on
              Moonspun. Here&apos;s how we protect your privacy in simple
              terms.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 text-moon">
              <Lock className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                Information We Collect
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white md:text-base">
              We only collect information that helps make your child's experience
              better:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white md:text-base">
              <li>Your nickname or username</li>
              <li>Your child's nickname or name that you provide</li>
              <li>Your child's interests and hobbies</li>
              <li>The stories you create and read</li>
              <li>Your email address (for account management)</li>
            <p className="text-sm text-white ">Please note that we will not store your child’s data indefinitely. Your child’s data will be automatically deleted every 12months.</p>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 text-moon">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                How We Use Your Information
              </h2>
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white md:text-base">
              <li>To create personalized stories you&apos;ll love</li>
              <li>To remember your favorite stories and reading progress</li>
              <li>To make Moonspun better for everyone</li>
              <li>To keep you safe while using our service</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 text-moon">
              <Bell className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                Parent Controls
              </h2>
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white md:text-base">
              <li>Parents can view and manage all account information</li>
              <li>Parents can request to delete any information</li>
              <li>Parents control privacy settings</li>
              <li>Parents receive important notifications</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 text-moon">
              <CircleHelp className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-moon">
                Questions About Privacy?
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white md:text-base">
              If you or your parents have questions about privacy, you can:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white md:text-base">
              <li>
                Email our privacy team at{" "}
                <a
                  href="mailto:support@moon-spun.com"
                  className="text-indigo-500 underline underline-offset-4"
                >
                  support@moon-spun.com
                </a>
              </li>
              
              <li>
                Read our{" "}
               
                  Terms of Service
                
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-14 border-t border-slate-200 pt-8 text-center">
          <p className="text-xs text-moon md:text-sm">
            Last updated: April 2026
          </p>
          <p className="mt-2 text-xs text-moon md:text-sm">
            We&apos;re committed to protecting your privacy and creating a safe
            space for storytelling!
          </p>
        </div>
      </div>
    </section>
  );
}