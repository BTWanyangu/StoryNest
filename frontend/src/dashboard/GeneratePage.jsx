import { motion } from 'framer-motion';
import { useApp } from '../app/AppContext';
import { classNames, getSeriesLabel } from '../utils/storyUtils';
import {
  MotionButton,
  MotionCard,
  OptionGroup,
  StoryParagraphs,
} from '../components/shared/UI';

export default function GeneratePage() {
  const app = useApp();

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-1 font-display text-2xl text-moon sm:text-3xl">
        Create a new story
      </h2>

      <p className="mb-6 text-sm leading-6 text-muted">
        Choose a child, theme, length, and language.
      </p>

      {/* Empty state */}
      {!app.selectedProfile && (
        <MotionCard className="mb-6 rounded-xl2 border border-dashed border-white/15 bg-card/30 p-8 text-center">
          <div className="mb-3 text-5xl">🧒</div>
          <div className="mb-2 font-bold text-star">
            No children yet
          </div>
          <div className="mb-4 text-sm text-muted">
            Add your first child profile to start generating stories.
          </div>
          <MotionButton
            onClick={app.openAddProfileModal}
            className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-bold text-white"
          >
            Add your first child
          </MotionButton>
        </MotionCard>
      )}

      <div
        className={classNames(
          'space-y-6',
          !app.selectedProfile && 'opacity-35'
        )}
      >
        {/* Select child */}
        <div>
          <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
            Choose child
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {app.profiles.map((profile, index) => (
              <motion.button
                key={profile.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() =>
                  app.setSelectedProfileId(profile.id)
                }
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={classNames(
                  'relative rounded-xl2 border-2 p-5 text-center transition',
                  app.selectedProfileId === profile.id
                    ? 'border-moon bg-card shadow-[0_0_20px_rgba(255,217,125,.18)]'
                    : 'border-transparent bg-card hover:border-purple'
                )}
              >
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
              </motion.button>
            ))}

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
        </div>

        {/* Themes */}
        <MotionCard className="rounded-xl2 border border-white/10 bg-card/70 p-4">
          <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
            Themes
          </div>

          <div className="flex flex-wrap gap-3">
            {app.THEME_OPTIONS.map((theme) => {
              const selected = app.selectedThemes.includes(theme);

              return (
                <MotionButton
                  key={theme}
                  onClick={() => app.toggleTheme(theme)}
                  className={classNames(
                    'rounded-full border px-4 py-2 text-sm font-bold transition',
                    selected
                      ? 'border-moon bg-moon/10 text-moon'
                      : 'border-white/10 bg-night3 text-text hover:border-purple2 hover:text-purple3'
                  )}
                >
                  {theme}
                </MotionButton>
              );
            })}
          </div>
        </MotionCard>

        {/* Options */}
        <OptionGroup
          title="Length"
          options={app.LENGTHS}
          value={app.selectedLength}
          onChange={app.setSelectedLength}
        />

        <OptionGroup
          title="Optional moral direction"
          options={app.MORALS}
          value={app.selectedMoral}
          onChange={(value) =>
            app.setSelectedMoral(
              value === app.selectedMoral ? '' : value
            )
          }
        />

        {/* Language */}
        <MotionCard className="rounded-xl2 border border-white/10 bg-card/70 p-4">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
            Story language
          </label>

          <select
            value={app.selectedLanguage}
            onChange={(e) =>
              app.setSelectedLanguage(e.target.value)
            }
            className="w-full rounded-xl2 border border-white/10 bg-card px-4 py-3 text-sm text-text outline-none focus:border-purple2"
          >
            {app.LANGUAGE_OPTIONS.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </MotionCard>

        {/* Wish */}
        <MotionCard className="rounded-xl2 border border-white/10 bg-card/70 p-4">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
            Tonight&apos;s special detail
          </label>

          <textarea
            value={app.wish}
            onChange={(e) => app.setWish(e.target.value)}
            rows={3}
            className="w-full rounded-xl2 border border-white/10 bg-card px-4 py-3 text-sm text-text outline-none focus:border-purple2"
            placeholder="e.g. She lost a tooth today."
          />
        </MotionCard>

        {/* Series info */}
        {app.selectedProfile &&
          app.selectedProfileStories.length > 0 && (
            <MotionCard className="rounded-xl2 border border-white/10 bg-card p-4">
              <div className="mb-1 font-bold text-star">
                {getSeriesLabel(app.selectedProfile)}
              </div>
              <div className="text-sm text-muted">
                {app.selectedProfileStories.length} saved
                episode(s) in this story world.
              </div>
            </MotionCard>
          )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <MotionButton
            disabled={!app.selectedProfile || app.loadingStory}
            onClick={() => app.handleGenerateStory(false)}
            className="rounded-full bg-gradient-to-br from-moon2 to-moon px-6 py-3 text-sm font-extrabold text-night disabled:opacity-50"
          >
            {app.loadingStory ? 'Writing...' : 'Generate story'}
          </MotionButton>

          <MotionButton
            disabled={!app.selectedProfile || app.loadingStory}
            onClick={() => app.handleGenerateStory(true)}
            className="rounded-full border border-moon/30 px-6 py-3 text-sm font-bold text-moon disabled:opacity-50"
          >
            Auto next episode
          </MotionButton>
        </div>

        {/* Current story */}
        {app.currentStory && (
          <MotionCard className="rounded-xl2 border border-white/10 bg-card p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-2xl text-moon">
                  {app.currentStory.title}
                </h3>
                <div className="text-sm text-muted">
                  {app.currentStory.child_avatar}{' '}
                  {app.currentStory.child_name} ·{' '}
                  {app.currentStory.theme}
                </div>
              </div>

              <div className="flex gap-2">
                <MotionButton
                  onClick={() =>
                    app.speakStory(app.currentStory)
                  }
                  className="rounded-full border border-moon/30 bg-moon/10 px-4 py-2 text-sm font-bold text-moon"
                >
                  🔊 Narrate
                </MotionButton>

                <MotionButton
                  onClick={app.saveCurrentStory}
                  className="rounded-full bg-gradient-to-br from-purple to-purple2 px-4 py-2 text-sm font-bold text-white"
                >
                  Save
                </MotionButton>
              </div>
            </div>

            <div className="space-y-5">
              <StoryParagraphs
                text={app.currentStory.body}
              />
            </div>
          </MotionCard>
        )}
      </div>
    </motion.section>
  );
}