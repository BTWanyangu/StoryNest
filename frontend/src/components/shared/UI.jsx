import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { classNames } from '../../utils/storyUtils';

export function MotionCard({ children, className = '', delay = 0, ...props }) {
  return <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }} whileHover={{ y: -4, scale: 1.01 }} className={className} {...props}>{children}</motion.div>;
}

export function MotionButton({ children, className = '', ...props }) {
  return <motion.button whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className={className} {...props}>{children}</motion.button>;
}

export function OptionGroup({ title, options, value, onChange }) {
  return <MotionCard className="rounded-xl2 border border-white/10 bg-card/70 p-4"><div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">{title}</div><div className="flex flex-wrap gap-3">{options.map((option) => { const selected = option === value; return <MotionButton key={option} onClick={() => onChange(option)} className={classNames('rounded-full border px-4 py-2 text-sm font-bold transition', selected ? 'border-moon bg-moon/10 text-moon' : 'border-white/10 bg-night3 text-text hover:border-purple2 hover:text-purple3')}>{option}</MotionButton>; })}</div></MotionCard>;
}

export function StatBox({ label, value }) {
  return <div className="rounded-xl border border-white/10 bg-night3/50 p-4 text-center"><div className="text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">{label}</div><div className="mt-2 text-3xl font-extrabold text-star">{value}</div></div>;
}

export function InfoRow({ label, value }) {
  return <div className="flex items-center justify-between border-b border-white/10 py-3 text-sm"><div className="font-bold text-muted">{label}</div><div className="text-right text-text">{value}</div></div>;
}

export function Toast({ toast }) {
  return <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.94 }} className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-3 text-sm font-bold shadow-lg" style={{ background: toast.bg || '#6bcb77', color: toast.bg ? '#fff' : '#0d0d1a' }}>{toast.message}</motion.div>}</AnimatePresence>;
}

export function StoryParagraphs({ text = '' }) {
  return text.split(/\n\n+/).filter(Boolean).map((paragraph, index) => <motion.p key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="leading-8 text-[15px] text-text/95">{paragraph}</motion.p>);
}

export function StarsBackground() {
  const stars = useMemo(() => Array.from({ length: 90 }, (_, idx) => ({ id: idx, size: Math.random() * 2.5 + 0.5, left: Math.random() * 100, top: Math.random() * 100, delay: Math.random() * 6, duration: 2 + Math.random() * 4, opacity: Math.random() * 0.4 + 0.1 })), []);
  return <div className="pointer-events-none fixed inset-0 overflow-hidden">{stars.map((star) => <motion.div key={star.id} className="absolute rounded-full bg-white animate-twinkle" initial={{ opacity: 0 }} animate={{ opacity: star.opacity }} transition={{ delay: star.delay, duration: 1.2 }} style={{ width: `${star.size}px`, height: `${star.size}px`, left: `${star.left}%`, top: `${star.top}%`, '--d': `${star.duration}s`, '--delay': `${star.delay}s` }} />)}</div>;
}