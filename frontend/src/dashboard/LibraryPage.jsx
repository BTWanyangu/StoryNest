import { motion } from 'framer-motion';
import { useApp } from '../app/AppContext';
import { formatStoryDate } from '../utils/storyUtils';
import { MotionCard } from '../components/shared/UI';

export default function LibraryPage() {
  const app = useApp();

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-1 font-display text-2xl text-moon sm:text-3xl">
        Story Library
      </h2>

      <p className="mb-6 text-sm leading-6 text-muted">
        Saved stories grouped as a living bedtime library.
      </p>

      {app.library.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-white/15 bg-card/30 p-8 text-center text-muted">
          No saved stories yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {app.library.map((story, index) => (
            <MotionCard
              key={story.id || index}
              onClick={() => app.setStoryModalIndex(index)}
              className="cursor-pointer overflow-hidden rounded-xl2 border border-white/10 bg-card"
            >
              <img
                src={story.cover_image}
                alt={story.title}
                className="h-40 w-full object-cover"
              />

              <div className="p-4">
                <div className="mb-1 font-display text-xl text-moon">
                  {story.title}
                </div>

                <div className="text-xs text-muted">
                  {story.child_avatar} {story.child_name} · Episode{' '}
                  {story.episode_number || 1}
                </div>

                <div className="mt-2 text-xs text-purple3">
                  {formatStoryDate(story.created_at)}
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      )}
    </motion.section>
  );
}