import { motion } from 'framer-motion';
import { useApp } from '../app/AppContext';
import { MotionButton, MotionCard } from '../components/shared/UI';

export default function ChildrenPage() {
  const app = useApp();

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-1 font-display text-2xl text-moon sm:text-3xl">
        Children
      </h2>

      <p className="mb-6 text-sm leading-6 text-muted">
        Manage child profiles, ages, interests, siblings, and recurring
        companions.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {app.profiles.map((profile, index) => (
          <MotionCard
            key={profile.id}
            delay={index * 0.04}
            className="relative rounded-xl2 border border-white/10 bg-card p-5 text-center"
          >
            {/* Actions */}
            <div className="absolute right-3 top-3 flex gap-2">
              <MotionButton
                onClick={() =>
                  app.openEditProfileModal(profile)
                }
                className="flex h-7 w-7 items-center justify-center rounded-full bg-moon/15 text-xs text-moon"
              >
                ✎
              </MotionButton>

              <MotionButton
                onClick={() =>
                  app.removeProfile(profile.id)
                }
                className="flex h-7 w-7 items-center justify-center rounded-full bg-coral/15 text-xs text-coral"
              >
                ✕
              </MotionButton>
            </div>

            {/* Profile */}
            <div className="mb-2 text-5xl">
              {profile.avatar}
            </div>

            <div className="text-base font-extrabold text-star">
              {profile.name}
            </div>

            <div className="text-xs text-muted">
              {profile.age} years old
            </div>

            {profile.interests && (
              <div className="mt-1 text-xs italic text-purple3">
                Loves: {profile.interests}
              </div>
            )}

            {/* Companion */}
            {profile.companion_name && (
              <div className="mt-3 rounded-lg border border-white/10 bg-night3/60 p-3 text-left">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-moon">
                  Companion
                </div>

                <div className="text-sm font-bold text-star">
                  {profile.companion_name}
                </div>

                <div className="text-xs text-muted">
                  {profile.companion_type || 'friend'}
                  {profile.companion_trait
                    ? ` · ${profile.companion_trait}`
                    : ''}
                </div>
              </div>
            )}
          </MotionCard>
        ))}

        {/* Add child */}
        {app.profiles.length < app.maxProfiles && (
          <MotionButton
            onClick={app.openAddProfileModal}
            className="rounded-xl2 border-2 border-dashed border-white/15 p-5 text-center text-muted transition hover:border-purple hover:text-text"
          >
            <div className="mb-2 text-4xl">➕</div>
            <div className="font-bold">Add child</div>
          </MotionButton>
        )}
      </div>
    </motion.section>
  );
}