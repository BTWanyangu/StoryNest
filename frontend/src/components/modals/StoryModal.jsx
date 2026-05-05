import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../app/AppContext';
import { formatStoryDate } from '../../utils/storyUtils';
import { MotionButton, StoryParagraphs } from '../shared/UI';

export default function StoryModal() {
  const app = useApp();

  const story =
    app.storyModalIndex !== null
      ? app.library[app.storyModalIndex]
      : null;

  if (!story) return null;

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
          className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl2 border border-white/10 bg-card p-5 sm:p-6"
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <img
                src={story.cover_image}
                alt={story.title}
                className="h-20 w-20 rounded-xl border border-white/10 bg-night3 object-cover"
              />

              <div>
                <div className="font-display text-2xl text-moon sm:text-3xl">
                  {story.title}
                </div>
                <div className="text-sm text-muted">
                  {story.child_avatar} {story.child_name} · {story.theme} ·
                  {' '}Episode {story.episode_number || 1} ·{' '}
                  {formatStoryDate(story.created_at)}
                </div>
              </div>
            </div>

            <MotionButton
              onClick={() => app.setStoryModalIndex(null)}
              className="text-muted"
            >
              ✕
            </MotionButton>
          </div>

          {/* Body */}
          <div className="space-y-5">
            <StoryParagraphs text={story.body} />
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <MotionButton
              onClick={() =>
                app.speakStory(
                  story,
                  story.story_language || app.selectedLanguage
                )
              }
              className="rounded-full border border-moon/30 bg-moon/10 px-5 py-2.5 text-sm font-bold text-moon"
            >
              {app.speakingStoryId === story.id
                ? '🔊 Playing...'
                : '🔊 Voice narration'}
            </MotionButton>

            {app.speakingStoryId === story.id && (
              <>
                <MotionButton
                  onClick={
                    app.narrationPaused
                      ? app.resumeSpeaking
                      : app.pauseSpeaking
                  }
                  className="rounded-full border border-moon/25 bg-moon/10 px-5 py-2.5 text-sm font-bold text-moon"
                >
                  {app.narrationPaused ? '▶ Resume' : '⏸ Pause'}
                </MotionButton>

                <MotionButton
                  onClick={app.stopSpeaking}
                  className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral"
                >
                  ⏹ Stop
                </MotionButton>
              </>
            )}

            <MotionButton
              onClick={() => app.removeStory(app.storyModalIndex)}
              className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral"
            >
              Delete story
            </MotionButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}