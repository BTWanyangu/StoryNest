import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../app/AppContext';
import { classNames } from '../../utils/storyUtils';
import { MotionButton } from '../shared/UI';

export default function ProfileModal() {
  const app = useApp();

  if (!app.profileModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl2 border border-white/10 bg-card p-5 sm:p-6"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="font-display text-2xl text-moon">
              {app.editingProfileId
                ? 'Edit child profile'
                : 'Add child profile'}
            </div>
            <MotionButton
              onClick={app.closeProfileModal}
              className="text-muted"
            >
              ✕
            </MotionButton>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
              Name
            </label>
            <input
              value={app.profileForm.name}
              onChange={(e) => {
                app.setProfileForm((p) => ({
                  ...p,
                  name: e.target.value,
                }));
                app.setProfileError('');
              }}
              className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              placeholder="Mia"
            />
            {app.profileError && (
              <div className="mt-2 text-sm text-coral">
                {app.profileError}
              </div>
            )}
          </div>

          {/* Age + Interests */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                Age
              </label>
              <select
                value={app.profileForm.age}
                onChange={(e) =>
                  app.setProfileForm((p) => ({
                    ...p,
                    age: Number(e.target.value),
                  }))
                }
                className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              >
                {Array.from({ length: 10 }, (_, i) => i + 3).map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                Interests
              </label>
              <input
                value={app.profileForm.interests}
                onChange={(e) =>
                  app.setProfileForm((p) => ({
                    ...p,
                    interests: e.target.value,
                  }))
                }
                className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
                placeholder="dragons, stars, foxes"
              />
            </div>
          </div>

          {/* Sibling */}
          <div className="mb-4 rounded-xl2 border border-white/10 bg-night3/40 p-4">
            <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
              Optional sibling in stories
            </div>

            <input
              value={app.profileForm.sibling_name}
              onChange={(e) =>
                app.setProfileForm((p) => ({
                  ...p,
                  sibling_name: e.target.value,
                }))
              }
              className="mb-3 w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              placeholder="Sibling name"
            />

            <input
              value={app.profileForm.sibling_relationship}
              onChange={(e) =>
                app.setProfileForm((p) => ({
                  ...p,
                  sibling_relationship: e.target.value,
                }))
              }
              className="mb-3 w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              placeholder="Relationship"
            />

            <input
              type="number"
              min="1"
              value={app.profileForm.sibling_age}
              onChange={(e) =>
                app.setProfileForm((p) => ({
                  ...p,
                  sibling_age: e.target.value,
                }))
              }
              className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              placeholder="Sibling age"
            />
          </div>

          {/* Companion */}
          <div className="mb-4 rounded-xl2 border border-white/10 bg-night3/40 p-4">
            <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-moon">
              Recurring companion / sidekick
            </div>

            <input
              value={app.profileForm.companion_name}
              onChange={(e) =>
                app.setProfileForm((p) => ({
                  ...p,
                  companion_name: e.target.value,
                }))
              }
              className="mb-3 w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              placeholder="Companion name"
            />

            <input
              value={app.profileForm.companion_type}
              onChange={(e) =>
                app.setProfileForm((p) => ({
                  ...p,
                  companion_type: e.target.value,
                }))
              }
              className="mb-3 w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              placeholder="dragon, robot, fairy"
            />

            <input
              value={app.profileForm.companion_trait}
              onChange={(e) =>
                app.setProfileForm((p) => ({
                  ...p,
                  companion_trait: e.target.value,
                }))
              }
              className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              placeholder="brave but easily startled"
            />
          </div>

          {/* Avatar */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
              Avatar
            </label>

            <div className="grid grid-cols-5 gap-3">
              {app.PROFILE_AVATARS.map((avatar) => (
                <MotionButton
                  key={avatar}
                  onClick={() =>
                    app.setProfileForm((p) => ({
                      ...p,
                      avatar,
                    }))
                  }
                  className={classNames(
                    'rounded-sm2 border px-2 py-3 text-2xl transition',
                    app.profileForm.avatar === avatar
                      ? 'border-moon bg-moon/10'
                      : 'border-white/10 bg-night3'
                  )}
                >
                  {avatar}
                </MotionButton>
              ))}
            </div>
          </div>

          {/* Consent */}
          <div className="mb-4 rounded-sm2 bg-night3/60 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted">
              <input
                type="checkbox"
                checked={app.profileForm.consent}
                onChange={(e) => {
                  app.setProfileForm((p) => ({
                    ...p,
                    consent: e.target.checked,
                  }));
                  app.setConsentError('');
                }}
                className="mt-1"
              />
              I confirm I am the parent or guardian and consent to their
              personal data being processed.
            </label>

            {app.consentError && (
              <div className="mt-2 text-sm text-coral">
                {app.consentError}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <MotionButton
              onClick={app.closeProfileModal}
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-text"
            >
              Cancel
            </MotionButton>

            <MotionButton
              onClick={app.saveProfile}
              className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2.5 text-sm font-bold text-white"
            >
              {app.editingProfileId
                ? 'Save changes ✓'
                : 'Add child ✓'}
            </MotionButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}