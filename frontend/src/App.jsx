import { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { AnimatePresence, motion } from 'framer-motion';
import { AVATARS, LENGTHS, MORALS, STORY_ICONS } from './constants';
import { supabase } from './lib/supabase';
import logo from './assets/logo.png';
import { Sparkles, BookOpen, Users, Zap, Globe } from 'lucide-react';
import {
  createCheckoutSession,
  createPortalSession,
  deleteAccountApi,
  generateStory,
  getSubscriptionStatus,
  syncStripeSuccess,
} from './lib/api';
import FAQs from './components/FAQs';
import Stats from './components/Stats';
import Footer from './components/Footer';
import Review from './components/Reviews';

import Privacy from './components/Privacy';
import ToS from './components/ToS';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const initialForm = { email: '', password: '', name: '', parentConsent: false };

const initialProfile = {
  name: '',
  age: 7,
  interests: '',
  avatar: AVATARS[0],
  consent: false,
  companion_name: '',
  companion_type: '',
  companion_trait: '',
  sibling_name: '',
  sibling_age: '',
  sibling_relationship: '',
};

const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Mandarin (China)',
  'Tagalog (Filipino)',
  'Vietnamese',
  'Arabic',
  'Korean',
  'Russian',
  'Portuguese',
  'Hindi',
  'Haitian Creole',
  'Italian',
  'Punjabi',
  'Japanese',
  'Persian / Farsi',
  'Polish',
  'Turkish',
  'Dutch',
];

const THEME_OPTIONS = [
  'Dragons & mythical creatures',
  'Space journeys',
  'Magical adventure',
  'Superheroes & Special powers',
  'Friendship & belonging',
  'Animals & talking animals',
  'Underwater & ocean adventures',
  'Dinosaurs',
  'Fairy tales',
  'Pirates treasure hunts',
  'Science & inventions',
  'Time travel & history',
  'Robots & technology',
  'Sports & winning through team effort',
  'Nature & environmental adventures',
  'Dreamworld',
];

const VOICE_ROLE_OPTIONS = [
  { value: 'female', label: 'Female voice' },
  { value: 'male', label: 'Male voice' },
];

const PLAN_META = {
  free: {
    id: 'free',
    label: 'Free',
    displayPrice: '$0',
    stories: 3,
    children: 1,
    isPaid: false,
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    displayPrice: '$8.99',
    stories: 50,
    children: 3,
    isPaid: true,
  },
  pro_unlimited: {
    id: 'pro_unlimited',
    label: 'Pro Unlimited',
    displayPrice: '$14.99',
    stories: Infinity,
    children: 6,
    isPaid: true,
  },
};

const features = [
  [
    Sparkles,
    'Personalised',
    'Hearing their own name in every story sparks excitement and turns each moment into a memory you’ll never forget. Every child deserves a story that was made for no one else but them.',
  ],
  [
    BookOpen,
    'Story library',
    'Save their favourite stories to a personal library, they can return to anytime.',
  ],
  [
    Users,
    'Multi-child ready',
    'So every child feels included and is part of the magical experience. Pro supports up to 3 children, Pro Unlimited supports up to 6.',
  ],
  [
    Zap,
    'Fast generation',
    'New bedtime stories in 10–20 seconds. Plus a new age appropriate word for your child to learn every night to increase their vocabulary.',
  ],
  [
    Globe,
    'BILINGUAL MODE',
    'Bilingual children consistently outperform their peers in concentration, mental flexibility, and the ability to switch between complex tasks. Not because they are naturally smarter but because  using two languages every day builds a brain that is stronger, faster, and more resilient than one that has only ever needed one. Moonspun makes that advantage available to every child, one story at a time, each night at a time.',
  ],
];

function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

function formatSince(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

function formatStoryDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getSeriesLabel(profile) {
  if (!profile) return 'Story Series';
  if (profile.companion_name) return `${profile.name} & ${profile.companion_name} Adventures`;
  return `${profile.name}'s Adventures`;
}

function getPlanMeta(plan) {
  return PLAN_META[plan] || PLAN_META.free;
}

function buildPrompt(profile, theme, length, moral, wish, previousStories = [], autoMode = false, language = 'English') {
  const siblingBlock = profile.sibling_name
    ? `
SIBLING IN THE STORY: ${profile.sibling_name}, aged ${profile.sibling_age || 'unknown'}, who is ${profile.sibling_relationship || 'a sibling'}.
Weave them in as a companion character.
`
    : '';

  const companionBlock = profile.companion_name
    ? `
RECURRING COMPANION: ${profile.companion_name} is ${[
        profile.companion_type,
        profile.companion_trait,
      ]
        .filter(Boolean)
        .join(', ') || 'a beloved recurring companion'}.
This companion appears in all of ${profile.name}'s stories. Reference them as someone already known and loved.
`
    : '';

  const todayMomentBlock = wish
    ? `
TONIGHT'S SPECIAL DETAIL: Something that happened in ${profile.name}'s real day today — weave this into the story naturally as the inciting incident or a key moment:
"${wish}"
`
    : '';

  const continuityBlock = previousStories.length
    ? `
SERIES CONTINUITY:
These are previous adventures from ${profile.name}'s existing story world. Maintain continuity, emotional memory, and internal consistency. The new story must feel like the next true episode, not a reset.

${previousStories
  .map(
    (story, index) => `
PREVIOUS EPISODE ${index + 1}:
Title: ${story.title}
Theme: ${story.theme || 'bedtime adventure'}
Episode number: ${story.episode_number || index + 1}
Summary:
${story.body.slice(0, 1200)}
`
  )
  .join('\n')}

AUTO-GENERATE MODE: ${autoMode ? 'YES — continue the ongoing series naturally from what has come before.' : 'NO — create a fresh adventure in the same living story world, while preserving continuity.'}

CONSISTENCY RULES:
- Reference past adventures naturally, never as a recap dump
- Keep recurring characters emotionally continuous
- Let the world evolve, but remain recognisable
- Do not repeat the same conflict or gimmick
- Make this feel like the next beloved episode
`
    : `
This is the first story in a new Moonspun story world for ${profile.name}.
If there is a recurring companion, establish them in a way that feels instantly beloved and memorable.
AUTO-GENERATE MODE: ${autoMode ? 'Treat this as the opening episode of an ongoing series and create a world that clearly has room to continue.' : 'Create a deeply memorable standalone opening that can become a series later.'}
`;

  return `You are Moonspun — a master storyteller who crafts deeply personal bedtime
adventures for children. Your stories feel as though they were written by a
gifted human author who knows the child intimately. You write with warmth, wit,
and wonder. You never mention AI, algorithms, or generation. You never break the
magic. Every story you write is the best story that child has ever heard.

CRAFT RULES — follow these without exception:

1. OPEN WITH A BANG. Your first sentence must be so vivid, so unexpected,
   or so delightful that a tired parent reads it aloud and immediately wants
   to know what happens next. Never open with "${profile.name} was getting ready for
   bed." Never open with weather. Open in the middle of something happening.

2. USE THE CHILD'S NAME NATURALLY — not constantly. Use it the way a great
   author uses a protagonist's name: sparingly, purposefully, at moments of
   emotion or decision. Aim for once every 3–4 paragraphs.

3. WEAVE INTERESTS IN, DON'T ANNOUNCE THEM. If the child loves something,
   the story should feel made for that child — not like a template.

4. WRITE IN SCENES, NOT SUMMARIES. Show the moment. Scenes create wonder.

5. EVERY STORY NEEDS AN EMOTIONAL ARC. The child hero must face something,
   rise to meet it in a way that reveals their character, and reach a
   resolution that feels earned.

6. THE ENDING IS SACRED. The final paragraph must settle the child gently
   toward sleep and leave the parent with a feeling. Softer sounds, dimmer
   light, the child hero finding peace. Never end abruptly.

7. VOCABULARY MUST MATCH THE CHILD'S AGE.
   Age 3–4: simple words, short sentences, rhythm and repetition.
   Age 5–6: richer vocabulary, clear cause and effect.
   Age 7–9: layered sentences, metaphor, humour, complex emotion.
   Age 10+: near-adult prose, irony, interior thought.

8. USE ONE UNEXPECTED DETAIL that could only exist in this story. Something
   invented, vivid, and slightly magical. This is what parents screenshot.

NEVER DO ANY OF THE FOLLOWING:
— Open with "Once upon a time"
— Open with the child waking up or getting ready for bed
— Use the phrase "And so, ${profile.name} learned that..."
— End with an explicit moral stated as a sentence
— Describe the child as "brave" or "special" — show it instead
— Use the word "magical" or "wonderful" or "amazing" — earn the feeling
— Mention that the story was "generated" or "created" or "personalised"
— Write dialogue that sounds like adults explaining things to children
— Make the story feel like any other story the child could find anywhere

Write a bedtime story for a child with the following details:

CHILD'S NAME: ${profile.name}
AGE: ${profile.age}
INTERESTS: ${profile.interests || 'None given'}
TONIGHT'S THEME: ${theme}
STORY LENGTH: ${length}

${siblingBlock}

LANGUAGE: Write the story in ${language}, using vocabulary
appropriate for a ${profile.age}-year-old language learner.

${companionBlock}

${todayMomentBlock}

${moral ? `SOFT MORAL DIRECTION: The emotional undercurrent may gently reward qualities related to ${moral}, but do not state the moral explicitly.\n` : ''}

${continuityBlock}

Remember: this is the best story this child has ever heard. Make it so.

OUTPUT FORMAT:
— Story title on the first line, title case, no quotes, no label
— One blank line
— Story in flowing paragraphs with one blank line between each
— No preamble. No "Here is your story." No post-story commentary.
— The story is the only thing you output until the vocabulary section below

After the final paragraph of the story, leave one blank line, then add:

---
Tonight's word: [one word in ${language}] ([phonetic pronunciation])
— [simple, beautiful one-sentence definition written as if spoken gently
to the child, not defined clinically].`;
}

function parseStory(raw, profile, theme, moral, previousStories = [], language = 'English') {
  const cleaned = raw.trim();
  const labeledTitleMatch = cleaned.match(/^TITLE:\s*(.+)$/im);

  let title = `${profile.name}'s Moonspun Adventure`;
  let body = cleaned;

  if (labeledTitleMatch) {
    title = labeledTitleMatch[1].trim();
    body = cleaned.replace(/^TITLE:\s*.+\n?/im, '').trim();
  } else {
    const parts = cleaned.split(/\n\s*\n/);
    if (parts.length > 1 && parts[0].trim().length < 120) {
      title = parts[0].trim();
      body = parts.slice(1).join('\n\n').trim();
    }
  }

  const nextEpisode = previousStories.length + 1;
  const seriesId = profile.child_series_id || profile.id;
  const coverSeed = `${seriesId}-${profile.name}-${title}`;

  return {
    title,
    body,
    child_name: profile.name,
    child_avatar: profile.avatar,
    child_id: profile.id,
    theme,
    moral: moral || null,
    created_at: new Date().toISOString(),
    series_id: seriesId,
    episode_number: nextEpisode,
    story_language: language,
    voice_role: localStorage.getItem('moonspun_voice_role') || 'female',
    cover_image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(coverSeed)}`,
  };
}

function StarsBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, idx) => ({
        id: idx,
        size: Math.random() * 2.5 + 0.5,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 2 + Math.random() * 4,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          initial={{ opacity: 0 }}
          animate={{ opacity: star.opacity }}
          transition={{ delay: star.delay, duration: 1.2 }}
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
            ['--d']: `${star.duration}s`,
            ['--delay']: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.94 }}
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-3 text-sm font-bold shadow-lg"
          style={{ background: toast.bg || '#6bcb77', color: toast.bg ? '#fff' : '#0d0d1a' }}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StoryParagraphs({ text }) {
  return text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph, index) => (
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="leading-8 text-[15px] text-text/95"
      >
        {paragraph}
      </motion.p>
    ));
}

function MotionCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MotionButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function OptionGroup({ title, options, value, onChange }) {
  return (
    <MotionCard className="rounded-xl2 border border-white/10 bg-card/70 p-4">
      <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">{title}</div>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const selected = option === value;
          return (
            <MotionButton
              key={option}
              onClick={() => onChange(option)}
              className={classNames(
                'rounded-full border px-4 py-2 text-sm font-bold transition',
                selected
                  ? 'border-moon bg-moon/10 text-moon'
                  : 'border-white/10 bg-night3 text-text hover:border-purple2 hover:text-purple3'
              )}
            >
              {option}
            </MotionButton>
          );
        })}
      </div>
    </MotionCard>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-night3/50 p-4 text-center">
      <div className="text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">{label}</div>
      <div className="mt-2 text-3xl font-extrabold text-star">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
      <div className="font-bold text-muted">{label}</div>
      <div className="text-right text-text">{value}</div>
    </div>
  );
}


function EmbeddedCheckoutModal({ open, clientSecret, onClose }) {
  if (!open || !clientSecret) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-3 py-6 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 22, scale: 0.96 }}
          className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-white p-3 shadow-2xl sm:p-5"
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg"
            aria-label="Close checkout"
          >
            ✕
          </button>

          <div className="mb-3 rounded-2xl bg-[#17143f] px-4 py-4 text-white">
            <div className="text-sm font-extrabold uppercase tracking-[0.12em] text-moon">Secure checkout</div>
            <div className="mt-1 text-sm text-white/80">
              Your 3-day free trial starts today. You will be charged automatically after the trial ends unless you cancel.
            </div>
          </div>

          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(initialForm);
  const [authError, setAuthError] = useState('');
  const [session, setSession] = useState(null);
  const [userRecord, setUserRecord] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [library, setLibrary] = useState([]);
  const [selectedTab, setSelectedTab] = useState('generate');
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedThemes, setSelectedThemes] = useState([THEME_OPTIONS[0]]);
  const [selectedLength, setSelectedLength] = useState(LENGTHS[0]);
  const [selectedMoral, setSelectedMoral] = useState('');
  const [wish, setWish] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => localStorage.getItem('storynest_selected_language') || 'English'
  );
  const [currentStory, setCurrentStory] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [storyModalIndex, setStoryModalIndex] = useState(null);
  const [profileForm, setProfileForm] = useState(initialProfile);
  const [profileError, setProfileError] = useState('');
  const [consentError, setConsentError] = useState('');
  const [toast, setToast] = useState(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [subscription, setSubscription] = useState({ plan: 'free', status: 'none' });
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [speakingStoryId, setSpeakingStoryId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState('pro');
  const [checkoutClientSecret, setCheckoutClientSecret] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedVoiceRole, setSelectedVoiceRole] = useState(() => localStorage.getItem('moonspun_voice_role') || 'female');

  const token = session?.access_token;
  const user = session?.user;
  const storiesGenerated = userRecord?.stories_generated ?? 0;
  const currentPlan = subscription.plan || userRecord?.plan || 'free';
  const planMeta = getPlanMeta(currentPlan);
  const isPaidPlan = planMeta.isPaid;
  const maxProfiles = planMeta.children;
  const maxStories = planMeta.stories;
  const selectedProfile =
    profiles.find((item) => item.id === selectedProfileId) || profiles[0] || null;

  const selectedProfileStories = useMemo(
    () => (selectedProfile ? library.filter((item) => item.child_id === selectedProfile.id) : []),
    [library, selectedProfile]
  );

  const groupedLibrary = useMemo(() => {
    const groups = {};
    library.forEach((story) => {
      const key = story.series_id || story.child_id || story.id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(story);
    });

    return Object.values(groups)
      .map((stories) =>
        [...stories].sort((a, b) => {
          const aEpisode = a.episode_number || 0;
          const bEpisode = b.episode_number || 0;
          return aEpisode - bEpisode;
        })
      )
      .sort((a, b) => new Date(b[0]?.created_at || 0) - new Date(a[0]?.created_at || 0));
  }, [library]);

  function showToast(message, bg) {
    setToast({ message, bg });
  }

  function toggleTheme(theme) {
    setSelectedThemes((prev) => {
      if (prev.includes(theme)) {
        return prev.length === 1 ? prev : prev.filter((item) => item !== theme);
      }

      return [...prev, theme];
    });
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
    setSpeakingStoryId(null);
  }

  function getSpeechLang(language) {
    const map = {
      English: 'en-US',
      Spanish: 'es-ES',
      French: 'fr-FR',
      German: 'de-DE',
      'Mandarin (China)': 'zh-CN',
      'Tagalog (Filipino)': 'fil-PH',
      Vietnamese: 'vi-VN',
      Arabic: 'ar-SA',
      Korean: 'ko-KR',
      Russian: 'ru-RU',
      Portuguese: 'pt-PT',
      Hindi: 'hi-IN',
      'Haitian Creole': 'ht-HT',
      Italian: 'it-IT',
      Punjabi: 'pa-IN',
      Japanese: 'ja-JP',
      'Persian / Farsi': 'fa-IR',
      Polish: 'pl-PL',
      Turkish: 'tr-TR',
      Dutch: 'nl-NL',
    };

    return map[language] || 'en-US';
  }

  function getAvailableVoices() {
    if (!('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices() || [];
  }

  function pickBestVoice(language, voiceRole = selectedVoiceRole) {
    const targetLang = getSpeechLang(language).toLowerCase();
    const baseLang = targetLang.split('-')[0];
    const voices = getAvailableVoices();

    if (!voices.length) return null;

    const roleHints =
      voiceRole === 'male'
        ? ['male', 'man', 'david', 'daniel', 'george', 'fred', 'alex', 'thomas', 'mark']
        : ['female', 'woman', 'samantha', 'susan', 'victoria', 'karen', 'zira', 'anna', 'sara'];

    const languageMatches = voices.filter((voice) => {
      const voiceLang = voice.lang?.toLowerCase() || '';
      return voiceLang === targetLang || voiceLang.startsWith(baseLang);
    });

    const roleMatch = languageMatches.find((voice) =>
      roleHints.some((hint) => voice.name?.toLowerCase().includes(hint))
    );
    if (roleMatch) return roleMatch;

    if (languageMatches.length) return languageMatches[0];

    const englishFallback = voices.find((voice) => voice.lang?.toLowerCase().startsWith('en'));
    return englishFallback || voices[0] || null;
  }

  function waitForVoices(timeout = 1500) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve([]);
        return;
      }

      const immediate = getAvailableVoices();
      if (immediate.length) {
        resolve(immediate);
        return;
      }

      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        resolve(getAvailableVoices());
      };

      const timer = setTimeout(finish, timeout);

      window.speechSynthesis.onvoiceschanged = () => {
        clearTimeout(timer);
        finish();
        window.speechSynthesis.onvoiceschanged = null;
      };
    });
  }

  async function speakStory(story, language = selectedLanguage) {
  if (!isPaidPlan) {
    showToast('Voice narration is available on paid plans.', '#ff6b6b');
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast('Voice narration is not supported in this browser.', '#ff6b6b');
    return;
  }

  const storyId = story.id || story.title;
  const narrationLanguage = story.story_language || language || 'English';
  const narrationVoiceRole = story.voice_role || selectedVoiceRole;

  const BEDTIME_RATE = 0.68;
  const BEDTIME_PITCH = narrationVoiceRole === 'father' ? 0.78 : 0.88;
  const BEDTIME_VOLUME = 0.9;
  const PARAGRAPH_PAUSE_MS = 900;
  const TITLE_PAUSE_MS = 1200;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const speakText = (text, bestVoice) =>
    new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = getSpeechLang(narrationLanguage);
      utterance.rate = BEDTIME_RATE;
      utterance.pitch = BEDTIME_PITCH;
      utterance.volume = BEDTIME_VOLUME;

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang || utterance.lang;
      }

      utterance.onend = resolve;

      utterance.onerror = (event) => {
        if (event.error === 'interrupted' || event.error === 'canceled') {
          resolve();
          return;
        }

        reject(event);
      };

      window.speechSynthesis.speak(utterance);
    });

  try {
    stopSpeaking();
    await waitForVoices();

    const bestVoice = pickBestVoice(narrationLanguage, narrationVoiceRole);

    const paragraphs = String(story.body || '')
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    setSpeakingStoryId(storyId);

    window.speechSynthesis.cancel();

    await sleep(150);

    await speakText(story.title, bestVoice);
    await sleep(TITLE_PAUSE_MS);

    for (const paragraph of paragraphs) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      await speakText(paragraph, bestVoice);
      await sleep(PARAGRAPH_PAUSE_MS);
    }

    setSpeakingStoryId(null);
  } catch (error) {
    console.error('Narration setup failed:', error);
    setSpeakingStoryId(null);
    showToast('Could not play narration', '#ff6b6b');
  }
}

  useEffect(() => {
    localStorage.setItem('storynest_selected_language', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('moonspun_voice_role', selectedVoiceRole);
  }, [selectedVoiceRole]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!ignore) setSession(data.session ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      ignore = true;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function bootstrap() {
      if (!user || !token) {
        setUserRecord(null);
        setProfiles([]);
        setLibrary([]);
        setSubscription({ plan: 'free', status: 'none' });
        setScreen('landing');
        setLoadingAccount(false);
        return;
      }

      setLoadingAccount(true);
      setScreen('dashboard');

      const [
        { data: userData, error: userErr },
        { data: children, error: childrenErr },
        { data: stories, error: storiesErr },
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('children').select('*').eq('user_id', user.id).order('created_at'),
        supabase
          .from('stories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (userErr) console.error(userErr);
      if (childrenErr) console.error(childrenErr);
      if (storiesErr) console.error(storiesErr);

      setUserRecord(userData || null);
      setProfiles(children || []);
      setLibrary(stories || []);
      setSelectedProfileId((children || [])[0]?.id || null);

      try {
        const status = await getSubscriptionStatus(token);
        setSubscription(status);

        if (status.plan && status.plan !== userData?.plan) {
          await supabase.from('users').update({ plan: status.plan }).eq('id', user.id);
          setUserRecord((prev) => (prev ? { ...prev, plan: status.plan } : prev));
        }
      } catch (error) {
        console.error(error);
      }

      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      if (sessionId) {
        try {
          await syncStripeSuccess(token, sessionId);
          const latest = await getSubscriptionStatus(token);
          setSubscription(latest);
          showToast('🌙 Your plan is now active!');
        } catch (error) {
          console.error(error);
        } finally {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }

      setLoadingAccount(false);
    }

    bootstrap();
  }, [token, user?.id]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  async function handleAuthSubmit() {
    const { email, password, name, parentConsent } = authForm;
    if (!email || !password) return setAuthError('Please fill in all fields');
    if (!email.includes('@')) return setAuthError('Please enter a valid email');
    if (password.length < 6) return setAuthError('Password must be at least 6 characters');
    if (authMode === 'signup' && !parentConsent) {
      return setAuthError('Please confirm you are a parent or guardian');
    }

    setAuthError('');
    const payload =
      authMode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { data: { name } } })
        : await supabase.auth.signInWithPassword({ email, password });

    if (payload.error) {
      setAuthError(payload.error.message);
      return;
    }

    setAuthForm(initialForm);
  }

  async function signOut() {
    stopSpeaking();
    await supabase.auth.signOut();
    setScreen('landing');
    setSelectedTab('generate');
  }

  async function saveProfile() {
    if (!profileForm.name.trim()) {
      setProfileError("Please enter your child's name");
      return;
    }
    if (!profileForm.consent) {
      setConsentError('Please tick the consent box');
      return;
    }
    if (profiles.length >= maxProfiles) {
      showToast(
        isPaidPlan
          ? `Maximum of ${maxProfiles} children reached for your plan.`
          : 'Free plan supports 1 child. Upgrade for more.',
        '#ff6b6b'
      );
      return;
    }

    const { data, error } = await supabase
      .from('children')
      .insert({
        user_id: user.id,
        name: profileForm.name.trim(),
        age: Number(profileForm.age),
        interests: profileForm.interests.trim(),
        avatar: profileForm.avatar,
        companion_name: profileForm.companion_name.trim(),
        companion_type: profileForm.companion_type.trim(),
        companion_trait: profileForm.companion_trait.trim(),
        sibling_name: profileForm.sibling_name.trim(),
        sibling_age: profileForm.sibling_age ? Number(profileForm.sibling_age) : null,
        sibling_relationship: profileForm.sibling_relationship.trim(),
        consent_given_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      showToast('Could not save profile', '#ff6b6b');
      return;
    }

    setProfiles((prev) => [...prev, data]);
    setSelectedProfileId(data.id);
    setProfileForm(initialProfile);
    setProfileError('');
    setConsentError('');
    setProfileModalOpen(false);
    showToast(`${data.name} added! Ready for tonight's story 🌙`);
  }

  async function removeProfile(profileId) {
    const profile = profiles.find((item) => item.id === profileId);
    if (!profile) return;
    if (!window.confirm(`Remove ${profile.name}'s profile? This won't delete saved stories.`)) return;

    const { error } = await supabase.from('children').delete().eq('id', profileId);
    if (error) {
      showToast('Could not remove profile', '#ff6b6b');
      return;
    }

    const nextProfiles = profiles.filter((item) => item.id !== profileId);
    setProfiles(nextProfiles);
    setSelectedProfileId(nextProfiles[0]?.id || null);
    showToast(`${profile.name}'s profile removed`, '#ff9898');
  }

  async function handleGenerateStory(autoMode = false) {
    if (!selectedProfile || !token) return;

    if (!isPaidPlan) {
      showToast('Please start your 3-day trial to generate stories.', '#ff6b6b');
      return;
    }

    if (storiesGenerated >= maxStories) {
      showToast(
        currentPlan === 'free'
          ? 'You have used your 3 free stories. Upgrade to continue.'
          : currentPlan === 'pro'
          ? 'You have reached your 50-story monthly allowance. Upgrade to Pro Unlimited.'
          : 'Story limit reached.',
        '#ff6b6b'
      );
      return;
    }

    if (autoMode && !isPaidPlan) {
      showToast('Auto-generate next episode is available on paid plans.', '#ff6b6b');
      return;
    }

    setLoadingStory(true);
    try {
      const previousStories = selectedProfileStories.slice(0, 3);
      const prompt = buildPrompt(
        selectedProfile,
        selectedThemes.join(', '),
        selectedLength,
        selectedMoral,
        wish.trim(),
        previousStories,
        autoMode,
        selectedLanguage
      );

      const data = await generateStory(token, prompt);
      const story = parseStory(
        data.text,
        selectedProfile,
        selectedThemes.join(', '),
        selectedMoral,
        previousStories,
        selectedLanguage
      );

      setCurrentStory(story);

      const nextCount = storiesGenerated + 1;
      const { error } = await supabase
        .from('users')
        .update({ stories_generated: nextCount })
        .eq('id', user.id);

      if (!error) {
        setUserRecord((prev) => (prev ? { ...prev, stories_generated: nextCount } : prev));
      }

      showToast(autoMode ? 'Next episode ready 🌙' : 'Story ready for tonight 🌙');
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Could not generate story', '#ff6b6b');
    } finally {
      setLoadingStory(false);
    }
  }

  async function saveCurrentStory() {
    if (!currentStory) return;

    const alreadySaved = library.some(
      (item) => item.title === currentStory.title && item.body === currentStory.body
    );
    if (alreadySaved) {
      showToast('Already saved to your library!');
      return;
    }

    const episodeCount = library.filter(
      (s) => (s.series_id || s.child_id) === (currentStory.series_id || currentStory.child_id)
    ).length;

    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        child_id: currentStory.child_id,
        child_name: currentStory.child_name,
        child_avatar: currentStory.child_avatar,
        title: currentStory.title,
        body: currentStory.body,
        theme: currentStory.theme,
        moral: currentStory.moral || selectedMoral || null,
        series_id: currentStory.series_id || currentStory.child_id,
        episode_number: currentStory.episode_number || episodeCount + 1,
        story_language: currentStory.story_language || selectedLanguage,
        voice_role: currentStory.voice_role || selectedVoiceRole,
        cover_image:
          currentStory.cover_image ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentStory.title)}`,
      })
      .select()
      .single();

    if (error) {
      showToast('Could not save story', '#ff6b6b');
      return;
    }

    setLibrary((prev) => [data, ...prev]);
    showToast('Story saved to your library! 📚');
  }

  async function removeStory(index) {
    const story = library[index];
    if (!story) return;
    const { error } = await supabase.from('stories').delete().eq('id', story.id);
    if (error) {
      showToast('Could not delete story', '#ff6b6b');
      return;
    }
    setLibrary((prev) => prev.filter((item) => item.id !== story.id));
    setStoryModalIndex(null);
    showToast(`"${story.title}" deleted`, '#ff9898');
  }

  async function startCheckout(planId = selectedCheckoutPlan) {
    try {
      const data = await createCheckoutSession(token, planId);
      const clientSecret = data.clientSecret || data.client_secret;

      if (clientSecret) {
        setCheckoutClientSecret(clientSecret);
        setCheckoutModalOpen(true);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error('Checkout session was created but no checkout client secret was returned.');
    } catch (error) {
      showToast(error.message, '#ff6b6b');
    }
  }

  async function openBillingPortal() {
    try {
      const data = await createPortalSession(token);
      window.location.href = data.url;
    } catch (error) {
      showToast(error.message, '#ff6b6b');
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('This will permanently delete your account and all data. Are you sure?')) return;
    try {
      stopSpeaking();
      await deleteAccountApi(token);
      await supabase.auth.signOut();
      showToast('Account deleted');
    } catch (error) {
      showToast(error.message, '#ff6b6b');
    }
  }

  const accountSince = user ? formatSince(user.created_at) : '—';
  const firstName =
    userRecord?.name?.split(' ')[0] ||
    user?.user_metadata?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';

  const tabItems = [
    { id: 'generate', label: 'New Story', icon: '✨' },
    { id: 'library', label: 'Story Library', icon: '📚' },
    { id: 'profiles', label: 'Children', icon: '🧒' },
    { id: 'account', label: 'Account', icon: '⚙️' },
  ];

  return (
    <div className="relative min-h-screen bg-night text-text">
      <StarsBackground />

      <div className="relative z-10 min-h-screen">
        {screen !== 'dashboard' ? (
          <>
            <motion.nav
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-night/80 px-4 py-4 backdrop-blur md:px-8"
            >
              <MotionButton onClick={() => setScreen('landing')} className="flex items-center gap-2 font-display">
                <img src={logo} alt="Moonspun Logo" className="h-24 md:h-24 w-auto object-contain" />
              </MotionButton>

              <div className="hidden items-center gap-3 sm:flex">
                <MotionButton
                  onClick={() => {
                    setAuthMode('login');
                    setScreen('auth');
                  }}
                  className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-text transition hover:border-purple2 hover:text-purple3"
                >
                  Sign in
                </MotionButton>
                <MotionButton
                  onClick={() => {
                    setAuthMode('signup');
                    setScreen('auth');
                  }}
                  className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2 text-sm font-bold text-white shadow-purple"
                >
                  Start trial
                </MotionButton>
              </div>

              <MotionButton
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="rounded-full border border-white/15 px-3 py-2 text-sm text-text sm:hidden"
              >
                ☰
              </MotionButton>
            </motion.nav>

            <AnimatePresence>
              {mobileMenuOpen && screen !== 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="border-b border-white/10 bg-night2 px-4 py-4 sm:hidden"
                >
                  <div className="flex flex-col gap-3">
                    <MotionButton
                      onClick={() => {
                        setAuthMode('login');
                        setScreen('auth');
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-text"
                    >
                      Sign in
                    </MotionButton>
                    <MotionButton
                      onClick={() => {
                        setAuthMode('signup');
                        setScreen('auth');
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-bold text-white"
                    >
                      Start trial
                    </MotionButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {screen === 'landing' && (
              <>
                <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 block text-6xl animate-floaty sm:text-7xl md:text-8xl"
                  >
                    🌙
                  </motion.span>

                  <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-3 max-w-5xl  text-3xl leading-tight text-moon sm:text-4xl md:text-5xl lg:text-6xl"
                  >
                     They won’t stay little forever so make <em className="text-purple3">bedtime count</em>  together.
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8 md:text-[1.05rem]"
                  >
                    86% of working parents feel they’re missing precious moments with their children - as excessive screen time quietly takes over. Moonspun helps you take those moments back, turning bedtime into magical, calming experiences you share together. Personalised stories, made in seconds, with your child at the heart of every adventure.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-12 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row"
                  >
                    <MotionButton
                      onClick={() => {
                        setAuthMode('signup');
                        setScreen('auth');
                      }}
                      className="rounded-full bg-gradient-to-br from-moon2 to-moon px-8 py-4 text-base font-extrabold text-night shadow-moon"
                    >
                      Start 3-day trial
                    </MotionButton>
                    <MotionButton
                      onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                      className="rounded-full border border-white/20 px-8 py-4 text-base font-bold text-text transition hover:border-purple2 hover:text-purple3"
                    >
                      See pricing
                    </MotionButton>
                  </motion.div>

                  <div className="grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {features.map(([Icon, title, desc], index) => (
                      <MotionCard
                        key={title}
                        delay={0.06 * index}
                        className="group relative overflow-hidden rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(36,34,82,0.96)_0%,rgba(24,22,60,0.96)_100%)] px-6 py-7 text-center shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#f5c85b]/45 hover:shadow-[0_18px_40px_rgba(11,10,40,0.42)]"
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70" />
                        <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#f5c85b]/10 blur-2xl opacity-0 transition duration-300 group-hover:opacity-100" />

                        <div className="mb-5 flex justify-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner shadow-white/5 transition duration-300 group-hover:scale-105 group-hover:border-[#f5c85b]/30 group-hover:bg-[#f5c85b]/[0.08]">
                            <Icon className="h-6 w-6 text-[#f5c85b]" strokeWidth={2.1} />
                          </div>
                        </div>

                        <h3 className="mb-2 text-[1.02rem] font-semibold tracking-tight text-white">{title}</h3>
                        <p className="text-sm leading-6 text-slate-300">{desc}</p>
                      </MotionCard>
                    ))}
                  </div>


                  <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-14 w-full max-w-5xl rounded-[28px] border border-white/12 bg-card/80 px-6 py-8 text-left shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:px-8 md:px-10"
                  >
                    <div className="mb-4 inline-flex rounded-full border border-moon/25 bg-moon/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-moon">
                      Better bedtime starts tonight
                    </div>

                    <h2 className="mb-5 font-display text-2xl leading-tight text-moon sm:text-3xl md:text-4xl">
                      Join thousands of parents who have already made the switch.
                    </h2>

                    <p className="mb-5 text-base leading-8 text-text/90">
                      74% of kids are addicted to screens before bedtime, often falling asleep to blue light that actively damages developing eyes and suppresses melatonin. They fall asleep eventually yes, but their brain doesn’t rest the way it should. It doesn’t happen overnight but it’s happening every night.
                    </p>

                    <p className="text-base leading-8 text-text/90">
                      Moonspun was created to address this globally increasing health concern in young developing children, by replacing screen time before bedtime with the one thing your child needs the most, your voice reading to them. Replace a screen with a deeper bond with your child tonight.
                    </p>
                  </motion.section>

                  

                  <motion.section
                    id="pricing"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-14 w-full text-center"
                  >
                    <h2 className="mb-2 font-display text-3xl text-moon">Choose your plan</h2>
                    <p className="mb-6 text-muted">
                      Both paid plans include a 3-day free trial. You are then charged automatically for the plan you have selected, after the free trial has ended, which you can cancel in your account at any time.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-5 lg:flex-row">
                      <MotionCard className="w-full max-w-[320px] rounded-xl2 border-2 border-moon bg-card p-7">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-moon px-4 py-1 text-[11px] font-extrabold text-night">
      MOST POPULAR
    </div>
                        <div className="mb-2 text-base font-extrabold text-star">Pro</div>
                        <div className="text-4xl font-extrabold text-moon">
                          $8.99<span className="text-sm font-normal text-muted">/month</span>
                        </div>
                        <div className="mt-4 space-y-2 text-left text-sm text-text">
                          <div><span className='text-moon font-bold'>✓</span> 50 stories per month</div>
                          <div><span className='text-moon font-bold'>✓</span> Up to 2 child profiles</div>
                          <div><span className='text-moon font-bold'>✓</span> Multilingual mode</div>
                          <div><span className='text-moon font-bold'>✓</span> Auto next episodes</div>
                          <div><span className='text-moon font-bold'>✓</span> Voice narration</div>
                          <div><span className='text-moon font-bold'>✓</span> 3-day free trial</div>
                        </div>
                        <div className="mt-4 text-xs leading-5 text-muted">
                          Card required. You will be charged automatically after the 3-day free trial ends unless you cancel.
                        </div>
                      </MotionCard>

                      <MotionCard className="relative w-full max-w-[320px] rounded-xl2 border-2 border-moon bg-card p-7">
                        
                        <div className="mb-2 text-base font-extrabold text-star">Pro Unlimited</div>
                        <div className="text-4xl font-extrabold text-moon">
                          $14.99<span className="text-sm font-normal text-muted">/month</span>
                        </div>
                        <div className="mt-4 space-y-2 text-left text-sm text-text">
                          <div><span className='text-moon font-bold'>✓</span> Unlimited stories per month</div>
                          <div><span className='text-moon font-bold'>✓</span> Up to 6 child profiles</div>
                          <div><span className='text-moon font-bold'>✓</span> Multilingual mode</div>
                          <div><span className='text-moon font-bold'>✓</span> Story series libray</div>
                          <div><span className='text-moon font-bold'>✓</span> Auto next episodes</div>
                          <div><span className='text-moon font-bold'>✓</span> Voice narration</div>
                          <div><span className='text-moon font-bold'>✓</span> 3-day free trial</div>
                        </div>
                        <div className="mt-4 text-xs leading-5 text-muted">
                          Card required. You will be charged automatically after the 3-day free trial ends unless you cancel.
                        </div>
                      </MotionCard>
                    </div>
                  </motion.section>
                </main>

                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                  <Stats />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                  <Review />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                  <FAQs />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                  <Footer setScreen={setScreen} />
                </motion.div>
              </>
            )}

            {screen === 'auth' && (
              <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="w-full max-w-md rounded-xl2 border border-white/10 bg-card p-6 sm:p-8"
                >
                  <h2 className="mb-1 text-center font-display text-2xl text-moon sm:text-3xl">
                    {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
                  </h2>
                  <p className="mb-7 text-center text-sm text-muted">
                    {authMode === 'signup'
                      ? 'Start your 3-day trial — card required, charged automatically after trial unless cancelled'
                      : 'Sign in to access your personalized stories and profiles'}
                  </p>

                  {authMode === 'signup' && (
                    <div className="mb-4">
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                        Your name
                      </label>
                      <input
                        value={authForm.name}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                        placeholder="Jane Parent"
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                      Email
                    </label>
                    <input
                      value={authForm.email}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                      Password
                    </label>
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                      placeholder="At least 6 characters"
                      onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
                    />
                  </div>

                  {authMode === 'signup' && (
                    <label className="mb-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted">
                      <input
                        type="checkbox"
                        checked={authForm.parentConsent}
                        onChange={(e) =>
                          setAuthForm((prev) => ({ ...prev, parentConsent: e.target.checked }))
                        }
                        className="mt-1"
                      />
                      I confirm I am a parent or guardian creating this account and I agree to the Privacy Policy and Terms.
                    </label>
                  )}

                  {authError && <div className="mb-4 text-sm text-coral">{authError}</div>}

                  <MotionButton
                    onClick={handleAuthSubmit}
                    className="w-full rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-base font-bold text-white shadow-purple"
                  >
                    {authMode === 'signup' ? 'Create account' : 'Sign in'}
                  </MotionButton>

                  <div className="mt-4 text-center text-sm text-muted">
                    {authMode === 'signup' ? 'Already have an account?' : `Don't have an account?`}{' '}
                    <button
                      onClick={() => setAuthMode((prev) => (prev === 'signup' ? 'login' : 'signup'))}
                      className="text-purple3 underline"
                    >
                      {authMode === 'signup' ? 'Sign in' : 'Sign up free'}
                    </button>
                  </div>
                </motion.div>
              </main>
            )}

            {screen === 'privacy' && (
              <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <Privacy />
              </main>
            )}

            {screen === 'ToS' && (
              <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <ToS />
              </main>
            )}
          </>
        ) : (
          <div className="flex min-h-screen flex-col">
            <motion.nav
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-night/85 px-4 py-3 backdrop-blur md:px-6"
            >
              <div className="flex items-center gap-2 font-display text-[1.2rem] text-moon md:text-[1.4rem]">
                <span className="text-[1.5rem] md:text-[1.6rem]">🌙</span>
              </div>
              <div className="text-xs text-muted sm:text-sm">Hi, {firstName} 👋</div>
            </motion.nav>

            <div className="grid flex-1 lg:grid-cols-[240px_1fr]">
              <aside className="order-2 border-t border-white/10 bg-night2 p-3 lg:order-1 lg:border-r lg:border-t-0 lg:p-4">
                <div className="grid grid-cols-4 gap-2 lg:flex lg:flex-col">
                  {tabItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => setSelectedTab(item.id)}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={classNames(
                        'flex items-center justify-center gap-2 rounded-sm2 px-3 py-3 text-sm font-bold transition lg:justify-start',
                        selectedTab === item.id ? 'bg-purple/20 text-purple3' : 'text-muted hover:bg-white/5 hover:text-text'
                      )}
                    >
                      <span>{item.icon}</span>
                      <span className="hidden lg:inline">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </aside>

              <main className="order-1 story-scroll max-h-[calc(100vh-61px)] overflow-y-auto p-4 sm:p-5 lg:order-2 lg:p-8">
                {selectedTab === 'generate' && (
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="mb-1 font-display text-2xl text-moon sm:text-3xl">Create a new story</h2>
                    <p className="mb-6 text-sm leading-6 text-muted">
                      Choose a child, theme, length, and language — then let Moonspun write tonight&apos;s bedtime story.
                    </p>

                    {!selectedProfile && (
                      <MotionCard className="mb-6 rounded-xl2 border border-dashed border-white/15 bg-card/30 p-8 text-center">
                        <div className="mb-3 text-5xl">🧒</div>
                        <div className="mb-2 font-bold text-star">No children yet</div>
                        <div className="mb-4 text-sm text-muted">Add your first child profile to start generating stories.</div>
                        <MotionButton
                          onClick={() => setProfileModalOpen(true)}
                          className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-bold text-white"
                        >
                          Add your first child
                        </MotionButton>
                      </MotionCard>
                    )}

                    <div className={classNames('space-y-6', !selectedProfile && 'opacity-35')}>
                      <div>
                        <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                          Choose child
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {profiles.map((profile, index) => (
                            <motion.button
                              key={profile.id}
                              initial={{ opacity: 0, y: 14 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.04 }}
                              onClick={() => setSelectedProfileId(profile.id)}
                              whileHover={{ y: -4, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              className={classNames(
                                'relative rounded-xl2 border-2 p-5 text-center transition',
                                selectedProfileId === profile.id
                                  ? 'border-moon bg-card shadow-[0_0_20px_rgba(255,217,125,.18)]'
                                  : 'border-transparent bg-card hover:border-purple'
                              )}
                            >
                              <div className="mb-2 text-5xl">{profile.avatar}</div>
                              <div className="text-base font-extrabold text-star">{profile.name}</div>
                              <div className="text-xs text-muted">{profile.age} years old</div>
                              {profile.interests && (
                                <div className="mt-1 text-xs italic text-purple3">Loves: {profile.interests}</div>
                              )}
                              {profile.companion_name && (
                                <div className="mt-1 text-[11px] text-moon">Companion: {profile.companion_name}</div>
                              )}
                              {profile.sibling_name && (
                                <div className="mt-1 text-[11px] text-muted">
                                  Sibling: {profile.sibling_name}
                                </div>
                              )}
                            </motion.button>
                          ))}

                          {profiles.length < maxProfiles && (
                            <MotionButton
                              onClick={() => setProfileModalOpen(true)}
                              className="rounded-xl2 border-2 border-dashed border-white/15 p-5 text-center text-muted transition hover:border-purple hover:text-text"
                            >
                              <div className="mb-2 text-4xl">➕</div>
                              <div className="font-bold">Add child</div>
                            </MotionButton>
                          )}
                        </div>
                      </div>

                      <MotionCard className="rounded-xl2 border border-white/10 bg-card/70 p-4">
                        <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                          Themes
                        </div>
                        <div className="mb-3 text-xs text-muted">Choose one or more themes for tonight&apos;s story.</div>
                        <div className="flex flex-wrap gap-3">
                          {THEME_OPTIONS.map((theme) => {
                            const selected = selectedThemes.includes(theme);
                            return (
                              <MotionButton
                                key={theme}
                                onClick={() => toggleTheme(theme)}
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
                      <OptionGroup title="Length" options={LENGTHS} value={selectedLength} onChange={setSelectedLength} />
                      <OptionGroup
                        title="Optional moral direction"
                        options={MORALS}
                        value={selectedMoral}
                        onChange={(value) => setSelectedMoral(value === selectedMoral ? '' : value)}
                      />

                      <MotionCard className="rounded-xl2 border border-white/10 bg-card/70 p-4">
                        <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                          Story language
                        </label>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="w-full rounded-xl2 border border-white/10 bg-card px-4 py-3 text-sm text-text outline-none transition focus:border-purple2"
                        >
                          {LANGUAGE_OPTIONS.map((language) => (
                            <option key={language} value={language}>
                              {language}
                            </option>
                          ))}
                        </select>
                      </MotionCard>

                      <MotionCard className="rounded-xl2 border border-white/10 bg-card/70 p-4">
                        <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                          Narration voice
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {VOICE_ROLE_OPTIONS.map((voice) => (
                            <MotionButton
                              key={voice.value}
                              onClick={() => setSelectedVoiceRole(voice.value)}
                              className={classNames(
                                'rounded-xl border px-4 py-3 text-sm font-bold transition',
                                selectedVoiceRole === voice.value
                                  ? 'border-moon bg-moon/10 text-moon'
                                  : 'border-white/10 bg-night3 text-text hover:border-purple2 hover:text-purple3'
                              )}
                            >
                              {voice.label}
                            </MotionButton>
                          ))}
                        </div>
                        <div className="mt-2 text-xs leading-5 text-muted">
                          We choose the closest matching voice available on the parent&apos;s device.
                        </div>
                      </MotionCard>

                      <MotionCard className="rounded-xl2 border border-white/10 bg-card/70 p-4">
                        <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                          Tonight&apos;s special detail
                        </label>
                        <textarea
                          value={wish}
                          onChange={(e) => setWish(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl2 border border-white/10 bg-card px-4 py-3 text-sm text-text outline-none transition focus:border-purple2"
                          placeholder="e.g. She lost a tooth today and kept checking under her pillow."
                        />
                      </MotionCard>

                      {selectedProfile && selectedProfileStories.length > 0 && (
                        <MotionCard className="rounded-xl2 border border-white/10 bg-card p-4">
                          <div className="mb-1 font-bold text-star">{getSeriesLabel(selectedProfile)}</div>
                          <div className="text-sm text-muted">
                            {selectedProfileStories.length} saved episode
                            {selectedProfileStories.length === 1 ? '' : 's'} in this story world.
                          </div>
                        </MotionCard>
                      )}

                      {!isPaidPlan && (
                        <MotionCard className="rounded-xl2 border border-moon/25 bg-card p-4">
                          <div className="mb-1 font-bold text-moon">Start your bedtime trial</div>
                          <div className="mb-3 text-sm text-muted">
                            Choose Pro or Pro Unlimited to start the 3-day trial. Card details are required, and the parent will be charged automatically after the trial ends unless they cancel.
                          </div>

                          <div className="mb-4 grid gap-3 md:grid-cols-2">
                            <button
                              onClick={() => setSelectedCheckoutPlan('pro')}
                              className={classNames(
                                'rounded-xl border px-4 py-3 text-left transition',
                                selectedCheckoutPlan === 'pro'
                                  ? 'border-moon bg-moon/10 text-moon'
                                  : 'border-white/10 bg-night3 text-text'
                              )}
                            >
                              <div className="font-bold">Pro</div>
                              <div className="text-sm text-muted">$8.99/mo · 50 stories · 3 children</div>
                            </button>

                            <button
                              onClick={() => setSelectedCheckoutPlan('pro_unlimited')}
                              className={classNames(
                                'rounded-xl border px-4 py-3 text-left transition',
                                selectedCheckoutPlan === 'pro_unlimited'
                                  ? 'border-moon bg-moon/10 text-moon'
                                  : 'border-white/10 bg-night3 text-text'
                              )}
                            >
                              <div className="font-bold">Pro Unlimited</div>
                              <div className="text-sm text-muted">$14.99/mo · Unlimited stories · 6 children</div>
                            </button>
                          </div>

                          <div className="mb-3 text-xs text-muted">
                            3-day free trial. You will be charged automatically after the 3-day free trial ends.
                          </div>

                          <MotionButton
                              onClick={() => startCheckout(selectedCheckoutPlan)}
                              className="rounded-full bg-gradient-to-br from-moon2 to-moon px-5 py-3 text-sm font-extrabold text-night"
                            >
                              Start {selectedCheckoutPlan === 'pro' ? 'Pro' : 'Pro Unlimited'} trial
                            </MotionButton>
                        </MotionCard>
                      )}

                      {isPaidPlan && currentPlan === 'pro' && (
                        <MotionCard className="rounded-xl2 border border-purple2/25 bg-card p-4">
                          <div className="mb-1 font-bold text-star">Pro plan usage</div>
                          <div className="mb-2 text-sm text-muted">
                            {storiesGenerated}/50 stories used this cycle · Up to 3 child profiles
                          </div>
                          <div className="mb-3 text-xs text-muted">
                            Need more? Upgrade to Pro Unlimited for unlimited stories and up to 6 children.
                          </div>
                          <MotionButton
                            onClick={() => startCheckout('pro_unlimited')}
                            className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-bold text-white"
                          >
                            Upgrade to Pro Unlimited
                          </MotionButton>
                        </MotionCard>
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <MotionButton
                          disabled={!selectedProfile || loadingStory}
                          onClick={() => handleGenerateStory(false)}
                          className="rounded-full bg-gradient-to-br from-moon2 to-moon px-8 py-4 text-base font-extrabold text-night shadow-moon transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loadingStory ? 'Generating your story...' : 'Generate story ✨'}
                        </MotionButton>

                        <MotionButton
                          disabled={!selectedProfile || loadingStory}
                          onClick={() => handleGenerateStory(true)}
                          className="rounded-full border border-purple2/40 bg-card px-6 py-4 text-base font-bold text-purple3 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          ⚡ Auto next episode
                        </MotionButton>
                      </div>
                    </div>

                    <AnimatePresence>
                      {currentStory && (
                        <motion.div
                          initial={{ opacity: 0, y: 22 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 22 }}
                          className="mt-8 rounded-xl2 border border-white/10 bg-card p-5 sm:p-6"
                        >
                          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex flex-col items-start gap-4 sm:flex-row">
                              {currentStory.cover_image ? (
                                <img
                                  src={currentStory.cover_image}
                                  alt={currentStory.title}
                                  className="h-20 w-20 rounded-xl border border-white/10 bg-night3 object-cover"
                                />
                              ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-night3 text-3xl">
                                  📖
                                </div>
                              )}

                              <div>
                                <div className="font-display text-2xl text-moon sm:text-3xl">{currentStory.title}</div>
                                <div className="text-sm text-muted">
                                  {currentStory.child_avatar} {currentStory.child_name} · {currentStory.theme} · Episode{' '}
                                  {currentStory.episode_number || 1} · {formatStoryDate(currentStory.created_at)}
                                </div>
                                {selectedProfile?.companion_name && (
                                  <div className="mt-1 text-xs text-purple3">
                                    Companion: {selectedProfile.companion_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-5">
                            <StoryParagraphs text={currentStory.body} />
                          </div>

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <MotionButton
                              onClick={saveCurrentStory}
                              className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2.5 text-sm font-bold text-white"
                            >
                              💾 Save to library
                            </MotionButton>
                            <MotionButton
                              onClick={() => handleGenerateStory(false)}
                              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-text"
                            >
                              🔄 Generate another
                            </MotionButton>
                            <MotionButton
                              onClick={() => handleGenerateStory(true)}
                              className="rounded-full border border-purple2/40 px-5 py-2.5 text-sm font-bold text-purple3"
                            >
                              ⚡ Next episode
                            </MotionButton>
                            <MotionButton
                              onClick={() =>
                                speakStory(
                                  { ...currentStory, id: currentStory.id || currentStory.title, voice_role: currentStory.voice_role || selectedVoiceRole },
                                  currentStory.story_language || selectedLanguage
                                )
                              }
                              className="rounded-full border border-moon/30 bg-moon/10 px-5 py-2.5 text-sm font-bold text-moon"
                            >
                              {speakingStoryId === (currentStory.id || currentStory.title)
                                ? '🔊 Playing...'
                                : '🔊 Voice narration'}
                            </MotionButton>
                            {speakingStoryId === (currentStory.id || currentStory.title) && (
                              <MotionButton
                                onClick={stopSpeaking}
                                className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral"
                              >
                                ⏹ Stop
                              </MotionButton>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.section>
                )}

                {selectedTab === 'library' && (
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="mb-1 font-display text-2xl text-moon sm:text-3xl">Story library</h2>
                    <p className="mb-6 text-sm leading-6 text-muted">
                      Saved bedtime stories live here as episodes, series, and growing story worlds.
                    </p>

                    {library.length === 0 ? (
                      <MotionCard className="rounded-xl2 border border-white/10 bg-card p-10 text-center">
                        <div className="mb-3 text-5xl">📚</div>
                        <div className="mb-2 font-bold text-star">Your library is empty</div>
                        <div className="mb-4 text-sm text-muted">
                          Generate a story and save it — it will appear here for your child to revisit.
                        </div>
                        <MotionButton
                          onClick={() => setSelectedTab('generate')}
                          className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-bold text-white"
                        >
                          Generate first story →
                        </MotionButton>
                      </MotionCard>
                    ) : (
                      <div className="space-y-8">
                        {groupedLibrary.map((series, seriesIndex) => {
                          const first = series[0];
                          const seriesProfile = profiles.find((p) => p.id === first?.child_id);
                          const seriesTitle = seriesProfile
                            ? getSeriesLabel(seriesProfile)
                            : `${first?.child_name || 'Story'} Adventures`;

                          return (
                            <MotionCard
                              key={first?.series_id || first?.id}
                              delay={seriesIndex * 0.05}
                              className="rounded-xl2 border border-white/10 bg-card p-5"
                            >
                              <div className="mb-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                {first?.cover_image ? (
                                  <img
                                    src={first.cover_image}
                                    alt={seriesTitle}
                                    className="h-20 w-20 rounded-xl border border-white/10 bg-night3 object-cover"
                                  />
                                ) : (
                                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-night3 text-3xl">
                                    {STORY_ICONS[0]}
                                  </div>
                                )}

                                <div>
                                  <div className="font-display text-xl text-moon sm:text-2xl">{seriesTitle}</div>
                                  <div className="text-sm text-muted">
                                    {series.length} episode{series.length === 1 ? '' : 's'} · {first?.child_avatar}{' '}
                                    {first?.child_name}
                                  </div>
                                </div>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {series.map((story, index) => {
                                  const libraryIndex = library.findIndex((item) => item.id === story.id);
                                  return (
                                    <motion.button
                                      key={story.id}
                                      onClick={() => setStoryModalIndex(libraryIndex)}
                                      whileHover={{ y: -5, scale: 1.01 }}
                                      whileTap={{ scale: 0.98 }}
                                      initial={{ opacity: 0, y: 14 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.03 }}
                                      className="rounded-xl2 border border-white/10 bg-night3/40 p-4 text-left transition hover:border-purple2/40"
                                    >
                                      {story.cover_image ? (
                                        <img
                                          src={story.cover_image}
                                          alt={story.title}
                                          className="mb-3 h-36 w-full rounded-lg border border-white/10 bg-night3 object-cover"
                                        />
                                      ) : (
                                        <div className="mb-3 flex h-36 w-full items-center justify-center rounded-lg border border-white/10 bg-night3 text-4xl">
                                          {STORY_ICONS[(story.episode_number || 1) % STORY_ICONS.length]}
                                        </div>
                                      )}

                                      <div className="mb-1 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                                        Episode {story.episode_number || 1}
                                      </div>
                                      <div className="mb-1 font-bold text-star">{story.title}</div>
                                      <div className="mb-3 text-sm text-purple3">
                                        {story.child_avatar} {story.child_name}
                                      </div>
                                      <div className="mb-4 line-clamp-3 text-sm leading-6 text-muted">{story.body}</div>
                                      <div className="text-xs text-muted">{formatStoryDate(story.created_at)}</div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </MotionCard>
                          );
                        })}
                      </div>
                    )}
                  </motion.section>
                )}

                {selectedTab === 'profiles' && (
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="mb-1 font-display text-2xl text-moon sm:text-3xl">Children</h2>
                    <p className="mb-6 text-sm leading-6 text-muted">
                      Manage child profiles, avatars, ages, interests, siblings, and recurring companions.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {profiles.map((profile, index) => (
                        <MotionCard
                          key={profile.id}
                          delay={index * 0.04}
                          className="relative rounded-xl2 border border-white/10 bg-card p-5 text-center"
                        >
                          <MotionButton
                            onClick={() => removeProfile(profile.id)}
                            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-coral/15 text-xs text-coral"
                          >
                            ✕
                          </MotionButton>
                          <div className="mb-2 text-5xl">{profile.avatar}</div>
                          <div className="text-base font-extrabold text-star">{profile.name}</div>
                          <div className="text-xs text-muted">{profile.age} years old</div>
                          {profile.interests && (
                            <div className="mt-1 text-xs italic text-purple3">Loves: {profile.interests}</div>
                          )}

                          {profile.sibling_name && (
                            <div className="mt-3 rounded-lg border border-white/10 bg-night3/60 p-3 text-left">
                              <div className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-purple3">
                                Sibling
                              </div>
                              <div className="text-sm font-bold text-star">{profile.sibling_name}</div>
                              <div className="text-xs text-muted">
                                {profile.sibling_relationship || 'Sibling'}
                                {profile.sibling_age ? ` · ${profile.sibling_age} years old` : ''}
                              </div>
                            </div>
                          )}

                          {profile.companion_name && (
                            <div className="mt-3 rounded-lg border border-white/10 bg-night3/60 p-3 text-left">
                              <div className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-moon">
                                Companion
                              </div>
                              <div className="text-sm font-bold text-star">{profile.companion_name}</div>
                              <div className="text-xs text-muted">
                                {profile.companion_type || 'friend'}
                                {profile.companion_trait ? ` · ${profile.companion_trait}` : ''}
                              </div>
                            </div>
                          )}
                        </MotionCard>
                      ))}

                      {profiles.length < maxProfiles && (
                        <MotionButton
                          onClick={() => setProfileModalOpen(true)}
                          className="rounded-xl2 border-2 border-dashed border-white/15 p-5 text-center text-muted transition hover:border-purple hover:text-text"
                        >
                          <div className="mb-2 text-4xl">➕</div>
                          <div className="font-bold">Add child</div>
                        </MotionButton>
                      )}
                    </div>
                  </motion.section>
                )}

                {selectedTab === 'account' && (
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="mb-1 font-display text-2xl text-moon sm:text-3xl">Account</h2>
                    <p className="mb-6 text-sm leading-6 text-muted">View your plan, usage, and billing controls.</p>

                    {loadingAccount ? (
                      <div className="text-sm text-muted">Loading account...</div>
                    ) : (
                      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
                        <MotionCard className="rounded-xl2 border border-white/10 bg-card p-5 sm:p-6">
                          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <StatBox label="Stories" value={storiesGenerated} />
                            <StatBox label="Saved" value={library.length} />
                            <StatBox label="Children" value={profiles.length} />
                          </div>

                          <InfoRow label="Name" value={userRecord?.name || user?.user_metadata?.name || '—'} />
                          <InfoRow label="Email" value={user?.email || '—'} />
                          <InfoRow label="Member since" value={accountSince} />

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <MotionButton
                              onClick={signOut}
                              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-text"
                            >
                              Sign out
                            </MotionButton>
                            {isPaidPlan && (
                              <MotionButton
                                onClick={openBillingPortal}
                                className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2.5 text-sm font-bold text-white"
                              >
                                Manage billing
                              </MotionButton>
                            )}
                          </div>

                          <div className="mt-8 border-t border-coral/15 pt-6">
                            <div className="mb-2 text-sm font-extrabold text-coral">Danger zone</div>
                            <div className="mb-4 text-sm leading-6 text-muted">
                              Permanently deletes your account, all child profiles, and all saved stories. This cannot be undone.
                            </div>
                            <MotionButton
                              onClick={handleDeleteAccount}
                              className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral"
                            >
                              Delete my account
                            </MotionButton>
                          </div>
                        </MotionCard>

                        <MotionCard className="rounded-xl2 border border-white/10 bg-card p-5 sm:p-6">
                          <div className="mb-1 text-sm font-extrabold uppercase tracking-[0.06em] text-purple3">
                            Current plan
                          </div>
                          <div className="mb-2 font-display text-2xl text-star">
                            {currentPlan === 'pro_unlimited'
                              ? 'Pro Unlimited'
                              : currentPlan === 'pro'
                              ? 'Pro'
                              : 'Free Plan'}
                          </div>
                          <div className="mb-4 text-4xl font-extrabold text-moon">
                            {planMeta.displayPrice}
                            <span className="text-sm font-normal text-muted">/month</span>
                          </div>

                          <div className="space-y-2 text-sm text-text">
                            {currentPlan === 'pro_unlimited' ? (
                              <>
                                <div>✓ Unlimited stories</div>
                                <div>✓ Up to 6 child profiles</div>
                                <div>✓ Story series library with cover images</div>
                                <div>✓ Auto next episode + voice narration</div>
                              </>
                            ) : currentPlan === 'pro' ? (
                              <>
                                <div>✓ 50 stories per month</div>
                                <div>✓ Up to 3 child profiles</div>
                                <div>✓ Story series library with cover images</div>
                                <div>✓ Auto next episode + voice narration</div>
                              </>
                            ) : (
                              <>
                                <div>✓ 3 free stories to try</div>
                                <div>✓ Save up to 3 free stories</div>
                                <div className="opacity-40">✗ Auto next episode</div>
                                <div className="opacity-40">✗ Voice narration & multiple children</div>
                              </>
                            )}
                          </div>

                          {!isPaidPlan ? (
                            <>
                              <div className="mt-5 grid gap-3">
                                <button
                                  onClick={() => setSelectedCheckoutPlan('pro')}
                                  className={classNames(
                                    'rounded-xl border px-4 py-3 text-left transition',
                                    selectedCheckoutPlan === 'pro'
                                      ? 'border-moon bg-moon/10 text-moon'
                                      : 'border-white/10 bg-night3 text-text'
                                  )}
                                >
                                  <div className="font-bold">Pro · $8.99/mo</div>
                                  <div className="text-xs text-muted">50 stories · 3 children · 3-day trial</div>
                                </button>
                                <button
                                  onClick={() => setSelectedCheckoutPlan('pro_unlimited')}
                                  className={classNames(
                                    'rounded-xl border px-4 py-3 text-left transition',
                                    selectedCheckoutPlan === 'pro_unlimited'
                                      ? 'border-moon bg-moon/10 text-moon'
                                      : 'border-white/10 bg-night3 text-text'
                                  )}
                                >
                                  <div className="font-bold">Pro Unlimited · $14.99/mo</div>
                                  <div className="text-xs text-muted">Unlimited stories · 6 children · 3-day trial</div>
                                </button>
                              </div>

                              <div className="mt-4 text-xs text-muted">
                                3-day free trial. You will be charged automatically after the 3-day free trial ends.
                              </div>

                              <MotionButton
                                onClick={() => startCheckout(selectedCheckoutPlan)}
                                className="mt-6 w-full rounded-full bg-gradient-to-br from-moon2 to-moon px-5 py-3 text-sm font-bold text-night"
                              >
                                Start {selectedCheckoutPlan === 'pro' ? 'Pro' : 'Pro Unlimited'} trial
                              </MotionButton>
                            </>
                          ) : currentPlan === 'pro' ? (
                            <MotionButton
                              onClick={() => startCheckout('pro_unlimited')}
                              className="mt-6 w-full rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-bold text-white"
                            >
                              Upgrade to Pro Unlimited
                            </MotionButton>
                          ) : (
                            <MotionButton
                              onClick={openBillingPortal}
                              className="mt-6 w-full rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-text"
                            >
                              Manage subscription
                            </MotionButton>
                          )}
                        </MotionCard>
                      </div>
                    )}
                  </motion.section>
                )}
              </main>
            </div>
          </div>
        )}

        <AnimatePresence>
          {profileModalOpen && (
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
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-display text-2xl text-moon">Add child profile</div>
                  <MotionButton onClick={() => setProfileModalOpen(false)} className="text-muted">
                    ✕
                  </MotionButton>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                    Name
                  </label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => {
                      setProfileForm((prev) => ({ ...prev, name: e.target.value }));
                      setProfileError('');
                    }}
                    className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                    placeholder="Mia"
                  />
                  {profileError && <div className="mt-2 text-sm text-coral">{profileError}</div>}
                </div>

                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                      Age
                    </label>
                    <select
                      value={profileForm.age}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, age: Number(e.target.value) }))}
                      className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                    >
                      {Array.from({ length: 10 }, (_, index) => index + 3).map((age) => (
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
                      value={profileForm.interests}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, interests: e.target.value }))}
                      className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                      placeholder="dragons, stars, foxes"
                    />
                  </div>
                </div>

                <div className="mb-4 rounded-xl2 border border-white/10 bg-night3/40 p-4">
                  <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                    Optional sibling in stories
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                        Sibling name
                      </label>
                      <input
                        value={profileForm.sibling_name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, sibling_name: e.target.value }))}
                        className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                        placeholder="Leo"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                        Relationship
                      </label>
                      <input
                        value={profileForm.sibling_relationship}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, sibling_relationship: e.target.value }))
                        }
                        className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                        placeholder="little brother"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                      Sibling age
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={profileForm.sibling_age}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, sibling_age: e.target.value }))}
                      className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="mb-4 rounded-xl2 border border-white/10 bg-night3/40 p-4">
                  <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-moon">
                    Recurring companion / sidekick
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                        Companion name
                      </label>
                      <input
                        value={profileForm.companion_name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, companion_name: e.target.value }))}
                        className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                        placeholder="Zara"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                        Companion type
                      </label>
                      <input
                        value={profileForm.companion_type}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, companion_type: e.target.value }))}
                        className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                        placeholder="dragon, robot, fairy"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                      Companion personality
                    </label>
                    <input
                      value={profileForm.companion_trait}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, companion_trait: e.target.value }))}
                      className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
                      placeholder="brave but easily startled"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
                    Avatar
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {AVATARS.map((avatar) => (
                      <MotionButton
                        key={avatar}
                        onClick={() => setProfileForm((prev) => ({ ...prev, avatar }))}
                        className={classNames(
                          'rounded-sm2 border px-2 py-3 text-2xl transition',
                          profileForm.avatar === avatar ? 'border-moon bg-moon/10' : 'border-white/10 bg-night3'
                        )}
                      >
                        {avatar}
                      </MotionButton>
                    ))}
                  </div>
                </div>

                <div className="mb-4 rounded-sm2 bg-night3/60 p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted">
                    <input
                      type="checkbox"
                      checked={profileForm.consent}
                      onChange={(e) => {
                        setProfileForm((prev) => ({ ...prev, consent: e.target.checked }));
                        setConsentError('');
                      }}
                      className="mt-1"
                    />
                    I confirm I am the parent or guardian of this child and consent to their personal data being processed as described in the Privacy Policy.
                  </label>
                  {consentError && <div className="mt-2 text-sm text-coral">{consentError}</div>}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <MotionButton
                    onClick={() => setProfileModalOpen(false)}
                    className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-text"
                  >
                    Cancel
                  </MotionButton>
                  <MotionButton
                    onClick={saveProfile}
                    className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Add child ✓
                  </MotionButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {storyModalIndex !== null && library[storyModalIndex] && (
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
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex flex-col items-start gap-4 sm:flex-row">
                    {library[storyModalIndex].cover_image ? (
                      <img
                        src={library[storyModalIndex].cover_image}
                        alt={library[storyModalIndex].title}
                        className="h-20 w-20 rounded-xl border border-white/10 bg-night3 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-night3 text-3xl">
                        📖
                      </div>
                    )}

                    <div>
                      <div className="font-display text-2xl text-moon sm:text-3xl">
                        {library[storyModalIndex].title}
                      </div>
                      <div className="text-sm text-muted">
                        {library[storyModalIndex].child_avatar} {library[storyModalIndex].child_name} ·{' '}
                        {library[storyModalIndex].theme} · Episode{' '}
                        {library[storyModalIndex].episode_number || 1} ·{' '}
                        {formatStoryDate(library[storyModalIndex].created_at)}
                      </div>
                    </div>
                  </div>

                  <MotionButton onClick={() => setStoryModalIndex(null)} className="text-muted">
                    ✕
                  </MotionButton>
                </div>

                <div className="space-y-5">
                  <StoryParagraphs text={library[storyModalIndex].body} />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                  <MotionButton
                    onClick={() =>
                      speakStory(
                        library[storyModalIndex],
                        library[storyModalIndex].story_language || selectedLanguage
                      )
                    }
                    className="rounded-full border border-moon/30 bg-moon/10 px-5 py-2.5 text-sm font-bold text-moon"
                  >
                    {speakingStoryId === library[storyModalIndex].id ? '🔊 Playing...' : '🔊 Voice narration'}
                  </MotionButton>

                  {speakingStoryId === library[storyModalIndex].id && (
                    <MotionButton
                      onClick={stopSpeaking}
                      className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral"
                    >
                      ⏹ Stop
                    </MotionButton>
                  )}

                  <MotionButton
                    onClick={() => removeStory(storyModalIndex)}
                    className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral"
                  >
                    Delete story
                  </MotionButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        
        <EmbeddedCheckoutModal
          open={checkoutModalOpen}
          clientSecret={checkoutClientSecret}
          onClose={() => {
            setCheckoutModalOpen(false);
            setCheckoutClientSecret('');
          }}
        />
        <Toast toast={toast} />
      </div>
    </div>
  );
}