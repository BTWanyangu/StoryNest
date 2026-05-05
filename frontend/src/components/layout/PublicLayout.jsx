import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import logo from '../../assets/logo.png';
import { useApp } from '../../app/AppContext';
import { MotionButton } from '../shared/UI';

export default function PublicLayout() {
  const app = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return <>
    <motion.nav initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-night/80 px-4 py-4 backdrop-blur md:px-8">
      <Link to="/" className="flex items-center gap-2 font-display"><img src={logo} alt="Moonspun Logo" className="h-16 w-auto object-contain sm:h-20 md:h-24" /></Link>
      <div className="hidden items-center gap-3 sm:flex">
        <MotionButton onClick={() => navigate('/login')} className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-text transition hover:border-purple2 hover:text-purple3">Sign in</MotionButton>
        <MotionButton onClick={() => app.choosePlanFromLanding('pro')} className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2 text-sm font-bold text-white shadow-purple">Start trial</MotionButton>
      </div>
      <MotionButton onClick={() => setMobileMenuOpen((prev) => !prev)} className="rounded-full border border-white/15 px-3 py-2 text-sm text-text sm:hidden">☰</MotionButton>
    </motion.nav>
    <AnimatePresence>{mobileMenuOpen && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="sticky top-[73px] z-20 border-b border-white/10 bg-night2 px-4 py-4 shadow-lg backdrop-blur sm:hidden"><div className="flex flex-col gap-3"><MotionButton onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-text">Sign in</MotionButton><MotionButton onClick={() => { app.choosePlanFromLanding('pro'); setMobileMenuOpen(false); }} className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-bold text-white">Start trial</MotionButton></div></motion.div>}</AnimatePresence>
    <Outlet />
  </>;
}