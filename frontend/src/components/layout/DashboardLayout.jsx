import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../app/AppContext';
import { classNames } from '../../utils/storyUtils';

const tabItems = [
  { to: '/app/generate', label: 'New Story', icon: '✨' },
  { to: '/app/library', label: 'Story Library', icon: '📚' },
  { to: '/app/children', label: 'Children', icon: '🧒' },
  { to: '/app/account', label: 'Account', icon: '⚙️' },
];

export default function DashboardLayout() {
  const { firstName } = useApp();
  return <div className="flex min-h-screen flex-col">
    <motion.nav initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-night/85 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3 font-display text-[1.2rem] text-moon md:text-[1.4rem]"><span className="text-[1.5rem] md:text-[1.6rem]">🌙</span><span>Moonspun</span></div>
      <div className="text-xs text-muted sm:text-sm">Hi, {firstName} 🌙</div>
    </motion.nav>
    <div className="grid flex-1 lg:grid-cols-[240px_1fr]">
      <aside className="order-2 border-t border-white/10 bg-night2 p-3 lg:order-1 lg:border-r lg:border-t-0 lg:p-4">
        <div className="grid grid-cols-4 gap-2 lg:flex lg:flex-col">
          {tabItems.map((item, index) => <motion.div key={item.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}><NavLink to={item.to} className={({ isActive }) => classNames('flex items-center justify-center gap-2 rounded-sm2 px-3 py-3 text-sm font-bold transition lg:justify-start', isActive ? 'bg-purple/20 text-purple3' : 'text-muted hover:bg-white/5 hover:text-text')}><span>{item.icon}</span><span className="hidden lg:inline">{item.label}</span></NavLink></motion.div>)}
        </div>
      </aside>
      <main className="order-1 story-scroll max-h-[calc(100vh-61px)] overflow-y-auto p-4 sm:p-5 lg:order-2 lg:p-8"><Outlet /></main>
    </div>
  </div>;
}