import { useEffect, useMemo, useState } from 'react';
import { AVATARS, LENGTHS, MORALS, STORY_ICONS, THEMES } from './constants';
import { supabase } from './lib/supabase';
import {
  createCheckoutSession,
  createPortalSession,
  deleteAccountApi,
  generateStory,
  getSubscriptionStatus,
  syncStripeSuccess,
} from './lib/api';

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
};

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

function buildPrompt(profile, theme, length, moral, wish, previousStories = [], autoMode = false) {
  const companionBlock = profile.companion_name
    ? `
Recurring companion:
- Name: ${profile.companion_name}
- Type: ${profile.companion_type || 'magical friend'}
- Personality: ${profile.companion_trait || 'kind and loyal'}

This companion must appear naturally throughout the story and feel emotionally important to ${profile.name}.
`
    : '';

  const continuityBlock = previousStories.length
    ? `
Previous adventures for continuity:
${previousStories.map((story, index) => `
Adventure ${index + 1}:
Title: ${story.title}
Theme: ${story.theme || 'bedtime adventure'}
Episode: ${story.episode_number || index + 1}
Summary:
${story.body.slice(0, 900)}
`).join('\n')}

Continuity rules:
- Reference previous adventures naturally
- Keep recurring characters consistent
- Do not repeat the exact same plot
- Make this feel like the next episode in the same story world
`
    : `
This is the first adventure in a new series. Establish a memorable story world and recurring emotional elements that can continue in future stories.
`;

  return `Write a bedtime story for a child named ${profile.name} who is ${profile.age} years old${profile.interests ? ` and loves ${profile.interests}` : ''}.

Story theme: ${theme}
Story length: ${length}
${moral ? `Moral lesson to include: ${moral}` : ''}
${wish ? `Special request from parent: ${wish}` : ''}
Mode: ${autoMode ? 'Continue the child’s ongoing story series automatically based on previous adventures.' : 'Create a new bedtime story in the child’s ongoing story world.'}

${companionBlock}

${continuityBlock}

Rules:
- Start with TITLE: [creative whimsical story title] on its own line
- Then write the story starting on the next line
- ${profile.name} MUST be the main hero/protagonist throughout
- Use age-appropriate vocabulary for a ${profile.age} year old
- Include vivid, imaginative, sensory descriptions
- Include emotional warmth and a sense of wonder
- Include a moment of challenge that ${profile.name} overcomes with ${moral || 'cleverness or kindness'}
- End peacefully and warmly — the story should make the child feel safe and sleepy
- Split into clear paragraphs (blank line between each)
- No violence, fear, or scary elements
- Warm, cosy, magical tone throughout
- If previous adventures exist, make this story feel like the next episode in that same world
- Output only the title and story`;
}

function parseStory(raw, profile, theme, moral, previousStories = []) {
  let title = `${profile.name}'s Magical Adventure`;
  let body = raw.trim();
  const match = raw.match(/^TITLE:\s*(.+)/m);
  if (match) {
    title = match[1].trim();
    body = raw.replace(/^TITLE:\s*.+\n?/m, '').trim();
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
    cover_image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(coverSeed)}`,
  };
}

function StarsBackground() {
  const stars = useMemo(
    () => Array.from({ length: 90 }, (_, idx) => ({
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
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
            opacity: star.opacity,
            ['--d']: `${star.duration}s`,
            ['--delay']: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-3 text-sm font-bold shadow-lg"
      style={{ background: toast.bg || '#6bcb77', color: toast.bg ? '#fff' : '#0d0d1a' }}
    >
      {toast.message}
    </div>
  );
}

function StoryParagraphs({ text }) {
  return text.split(/\n\n+/).filter(Boolean).map((paragraph, index) => (
    <p key={index} className="leading-8 text-[15px] text-text/95">
      {paragraph}
    </p>
  ));
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
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [selectedLength, setSelectedLength] = useState(LENGTHS[0]);
  const [selectedMoral, setSelectedMoral] = useState('');
  const [wish, setWish] = useState('');
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

  const token = session?.access_token;
  const user = session?.user;
  const storiesGenerated = userRecord?.stories_generated ?? 0;
  const isSubscribed = subscription.plan === 'premium';
  const maxProfiles = isSubscribed ? 3 : 1;
  const selectedProfile = profiles.find((item) => item.id === selectedProfileId) || profiles[0] || null;

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

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingStoryId(null);
  }

  function speakStory(story) {
    if (!isSubscribed) {
      showToast('Voice narration is a Premium feature.', '#ff6b6b');
      return;
    }

    if (!('speechSynthesis' in window)) {
      showToast('Voice narration is not supported in this browser.', '#ff6b6b');
      return;
    }

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(`${story.title}. ${story.body}`);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => setSpeakingStoryId(null);
    utterance.onerror = () => {
      setSpeakingStoryId(null);
      showToast('Could not play narration', '#ff6b6b');
    };

    setSpeakingStoryId(story.id || story.title);
    window.speechSynthesis.speak(utterance);
  }

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

      const [{ data: userData, error: userErr }, { data: children, error: childrenErr }, { data: stories, error: storiesErr }] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('children').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('stories').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
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
        if (status.plan === 'premium' && userData?.plan !== 'premium') {
          await supabase.from('users').update({ plan: 'premium' }).eq('id', user.id);
          setUserRecord((prev) => (prev ? { ...prev, plan: 'premium' } : prev));
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
          showToast('🌙 Premium activated successfully!');
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
    if (authMode === 'signup' && !parentConsent) return setAuthError('Please confirm you are a parent or guardian');

    setAuthError('');
    const payload = authMode === 'signup'
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
      setProfileError('Please enter your child\'s name');
      return;
    }
    if (!profileForm.consent) {
      setConsentError('Please tick the consent box');
      return;
    }
    if (profiles.length >= maxProfiles) {
      showToast(isSubscribed ? 'Maximum of 3 children reached.' : 'Free plan supports 1 child. Upgrade for up to 3!', '#ff6b6b');
      return;
    }

    const { data, error } = await supabase.from('children').insert({
      user_id: user.id,
      name: profileForm.name.trim(),
      age: Number(profileForm.age),
      interests: profileForm.interests.trim(),
      avatar: profileForm.avatar,
      companion_name: profileForm.companion_name.trim(),
      companion_type: profileForm.companion_type.trim(),
      companion_trait: profileForm.companion_trait.trim(),
      consent_given_at: new Date().toISOString(),
    }).select().single();

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
    if (!isSubscribed && storiesGenerated >= 3) {
      showToast('You have used your 3 free stories. Upgrade to continue.', '#ff6b6b');
      return;
    }
    if (autoMode && !isSubscribed) {
      showToast('Auto-generate next episode is a Premium feature.', '#ff6b6b');
      return;
    }

    setLoadingStory(true);
    try {
      const previousStories = selectedProfileStories.slice(0, 3);
      const prompt = buildPrompt(
        selectedProfile,
        selectedTheme,
        selectedLength,
        selectedMoral,
        wish.trim(),
        previousStories,
        autoMode
      );

      const data = await generateStory(token, prompt);
      const story = parseStory(
        data.text,
        selectedProfile,
        selectedTheme,
        selectedMoral,
        previousStories
      );

      setCurrentStory(story);

      const nextCount = storiesGenerated + 1;
      const { error } = await supabase.from('users').update({ stories_generated: nextCount }).eq('id', user.id);
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
    if (!isSubscribed) {
      showToast('Saving to the story library is a Premium feature.', '#ff6b6b');
      return;
    }

    const alreadySaved = library.some((item) => item.title === currentStory.title && item.body === currentStory.body);
    if (alreadySaved) {
      showToast('Already saved to your library!');
      return;
    }

    const episodeCount = library.filter((s) => (s.series_id || s.child_id) === (currentStory.series_id || currentStory.child_id)).length;

    const { data, error } = await supabase.from('stories').insert({
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
      cover_image: currentStory.cover_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentStory.title)}`,
    }).select().single();

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

  async function startCheckout() {
    try {
      const data = await createCheckoutSession(token);
      window.location.href = data.url;
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
  const firstName = userRecord?.name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const tabItems = [
    { id: 'generate', label: 'New Story', icon: '✨' },
    { id: 'library', label: 'Story Library', icon: '📚' },
    { id: 'profiles', label: 'Children', icon: '🧒' },
    { id: 'account', label: 'Account', icon: '⚙️' },
  ];

  return (
    <div className="relative min-h-screen">
      <StarsBackground />
      <div className="relative z-10 min-h-screen">
        {screen !== 'dashboard' ? (
          <>
            <nav className="flex items-center justify-between border-b border-white/10 px-4 py-4 md:px-8">
              <button onClick={() => setScreen('landing')} className="flex items-center gap-2 font-display text-[1.4rem] text-moon">
                <span className="text-[1.6rem]">🌙</span> StoryNest
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => { setAuthMode('login'); setScreen('auth'); }} className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-text transition hover:border-purple2 hover:text-purple3">Sign in</button>
                <button onClick={() => { setAuthMode('signup'); setScreen('auth'); }} className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2 text-sm font-bold text-white shadow-purple transition hover:-translate-y-0.5">Start free</button>
              </div>
            </nav>

            {screen === 'landing' && (
              <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col items-center justify-center px-4 py-12 text-center">
                <span className="mb-4 block text-7xl animate-floaty md:text-8xl">🌙</span>
                <h1 className="mb-3 max-w-4xl font-display text-4xl leading-tight text-moon md:text-6xl">Every night, a new story with <em className="italic text-purple3">your child</em> as the hero</h1>
                <p className="mb-8 max-w-2xl text-base leading-8 text-muted md:text-[1.05rem]">StoryNest creates personalised bedtime stories based on your child's name, age, interests, and chosen theme — magical, calming, and ready in seconds.</p>
                <div className="mb-12 flex flex-wrap justify-center gap-4">
                  <button onClick={() => { setAuthMode('signup'); setScreen('auth'); }} className="rounded-full bg-gradient-to-br from-moon2 to-moon px-9 py-4 text-base font-extrabold text-night shadow-moon transition hover:-translate-y-0.5">Create free account</button>
                  <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full border border-white/20 px-9 py-4 text-base font-bold text-text transition hover:border-purple2 hover:text-purple3">See pricing</button>
                </div>

                <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-4">
                  {[
                    ['✨', 'Personalised', 'Your child is the hero every time'],
                    ['📚', 'Story series', 'Save stories as episodes with cover art'],
                    ['🧒', 'Multi-child ready', 'Premium supports up to 3 child profiles'],
                    ['⚡', 'Fast generation', 'New bedtime stories in 10–20 seconds'],
                  ].map(([icon, title, desc]) => (
                    <div key={title} className="rounded-xl2 border border-white/10 bg-card p-5 text-center transition hover:border-purple2/40">
                      <div className="mb-2 text-3xl">{icon}</div>
                      <div className="mb-1 text-sm font-bold text-star">{title}</div>
                      <div className="text-xs leading-6 text-muted">{desc}</div>
                    </div>
                  ))}
                </div>

                <section id="pricing" className="mt-14 w-full text-center">
                  <h2 className="mb-2 font-display text-3xl text-moon">Simple pricing</h2>
                  <p className="mb-6 text-muted">Try StoryNest free, then unlock unlimited bedtime magic.</p>
                  <div className="flex flex-wrap justify-center gap-5">
                    <div className="w-full max-w-[240px] rounded-xl2 border border-white/10 bg-card p-7">
                      <div className="mb-2 text-base font-extrabold text-star">Free</div>
                      <div className="text-4xl font-extrabold text-moon">£0<span className="text-sm font-normal text-muted">/month</span></div>
                      <div className="mt-4 space-y-2 text-left text-sm text-text">
                        <div>✓ 3 free stories</div>
                        <div>✓ 1 child profile</div>
                        <div className="opacity-40">✗ Auto next episode</div>
                        <div className="opacity-40">✗ Story library & narration</div>
                      </div>
                    </div>
                    <div className="relative w-full max-w-[240px] rounded-xl2 border-2 border-moon bg-card p-7">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-moon px-4 py-1 text-[11px] font-extrabold text-night">MOST POPULAR</div>
                      <div className="mb-2 text-base font-extrabold text-star">Premium</div>
                      <div className="text-4xl font-extrabold text-moon">£5<span className="text-sm font-normal text-muted">/month</span></div>
                      <div className="mt-4 space-y-2 text-left text-sm text-text">
                        <div>✓ Unlimited stories</div>
                        <div>✓ Up to 3 child profiles</div>
                        <div>✓ Story series library + covers</div>
                        <div>✓ Auto next episodes + narration</div>
                      </div>
                    </div>
                  </div>
                </section>
              </main>
            )}

            {screen === 'auth' && (
              <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-xl2 border border-white/10 bg-card p-8">
                  <h2 className="mb-1 text-center font-display text-3xl text-moon">{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
                  <p className="mb-7 text-center text-sm text-muted">{authMode === 'signup' ? 'Start with 3 free stories — no card needed' : 'Sign in to your StoryNest'}</p>
                  {authMode === 'signup' && (
                    <div className="mb-4">
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Your name</label>
                      <input value={authForm.name} onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2" placeholder="Jane Parent" />
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Email</label>
                    <input value={authForm.email} onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))} className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2" placeholder="you@example.com" />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Password</label>
                    <input type="password" value={authForm.password} onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))} className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2" placeholder="At least 6 characters" onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()} />
                  </div>
                  {authMode === 'signup' && (
                    <label className="mb-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted">
                      <input type="checkbox" checked={authForm.parentConsent} onChange={(e) => setAuthForm((prev) => ({ ...prev, parentConsent: e.target.checked }))} className="mt-1" />
                      I confirm I am a parent or guardian creating this account and I agree to the Privacy Policy and Terms.
                    </label>
                  )}
                  {authError && <div className="mb-4 text-sm text-coral">{authError}</div>}
                  <button onClick={handleAuthSubmit} className="w-full rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-base font-bold text-white shadow-purple transition hover:-translate-y-0.5">{authMode === 'signup' ? 'Create account' : 'Sign in'}</button>
                  <div className="mt-4 text-center text-sm text-muted">
                    {authMode === 'signup' ? 'Already have an account?' : `Don't have an account?`}{' '}
                    <button onClick={() => setAuthMode((prev) => prev === 'signup' ? 'login' : 'signup')} className="text-purple3 underline">{authMode === 'signup' ? 'Sign in' : 'Sign up free'}</button>
                  </div>
                </div>
              </main>
            )}
          </>
        ) : (
          <div className="flex min-h-screen flex-col">
            <nav className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
              <div className="flex items-center gap-2 font-display text-[1.4rem] text-moon"><span className="text-[1.6rem]">🌙</span> StoryNest</div>
              <div className="text-sm text-muted">Hi, {firstName} 👋</div>
            </nav>
            <div className="grid flex-1 md:grid-cols-[220px_1fr]">
              <aside className="order-2 border-t border-white/10 bg-night2 p-3 md:order-1 md:border-r md:border-t-0 md:p-4">
                <div className="grid grid-cols-4 gap-2 md:flex md:flex-col">
                  {tabItems.map((item) => (
                    <button key={item.id} onClick={() => setSelectedTab(item.id)} className={classNames('flex items-center justify-center gap-2 rounded-sm2 px-3 py-3 text-sm font-bold transition md:justify-start', selectedTab === item.id ? 'bg-purple/20 text-purple3' : 'text-muted hover:bg-white/5 hover:text-text')}>
                      <span>{item.icon}</span>
                      <span className="hidden md:inline">{item.label}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <main className="order-1 story-scroll max-h-[calc(100vh-61px)] overflow-y-auto p-5 md:order-2 md:p-8">
                {selectedTab === 'generate' && (
                  <section>
                    <h2 className="mb-1 font-display text-3xl text-moon">Create a new story</h2>
                    <p className="mb-6 text-sm leading-6 text-muted">Choose a child, theme, and length — then let StoryNest write tonight's bedtime story.</p>

                    {!selectedProfile && (
                      <div className="mb-6 rounded-xl2 border border-dashed border-white/15 bg-card/30 p-8 text-center">
                        <div className="mb-3 text-5xl">🧒</div>
                        <div className="mb-2 font-bold text-star">No children yet</div>
                        <div className="mb-4 text-sm text-muted">Add your first child profile to start generating stories.</div>
                        <button onClick={() => setProfileModalOpen(true)} className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-bold text-white">Add your first child</button>
                      </div>
                    )}

                    <div className={classNames('space-y-6', !selectedProfile && 'opacity-35')}>
                      <div>
                        <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Choose child</div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {profiles.map((profile) => (
                            <button
                              key={profile.id}
                              onClick={() => setSelectedProfileId(profile.id)}
                              className={classNames(
                                'relative rounded-xl2 border-2 p-5 text-center transition',
                                selectedProfileId === profile.id ? 'border-moon bg-card shadow-[0_0_20px_rgba(255,217,125,.18)]' : 'border-transparent bg-card hover:-translate-y-0.5 hover:border-purple'
                              )}
                            >
                              <div className="mb-2 text-5xl">{profile.avatar}</div>
                              <div className="text-base font-extrabold text-star">{profile.name}</div>
                              <div className="text-xs text-muted">{profile.age} years old</div>
                              {profile.interests && <div className="mt-1 text-xs italic text-purple3">Loves: {profile.interests}</div>}
                              {profile.companion_name && <div className="mt-1 text-[11px] text-moon">Companion: {profile.companion_name}</div>}
                            </button>
                          ))}

                          {profiles.length < maxProfiles && (
                            <button onClick={() => setProfileModalOpen(true)} className="rounded-xl2 border-2 border-dashed border-white/15 p-5 text-center text-muted transition hover:border-purple hover:text-text">
                              <div className="mb-2 text-4xl">➕</div>
                              <div className="font-bold">Add child</div>
                            </button>
                          )}
                        </div>
                      </div>

                      <OptionGroup title="Theme" options={THEMES} value={selectedTheme} onChange={setSelectedTheme} />
                      <OptionGroup title="Length" options={LENGTHS} value={selectedLength} onChange={setSelectedLength} />
                      <OptionGroup title="Optional moral" options={MORALS} value={selectedMoral} onChange={(value) => setSelectedMoral(value === selectedMoral ? '' : value)} />

                      <div>
                        <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Optional custom wish</label>
                        <textarea value={wish} onChange={(e) => setWish(e.target.value)} rows={3} className="w-full rounded-xl2 border border-white/10 bg-card px-4 py-3 text-sm text-text outline-none transition focus:border-purple2" placeholder="e.g. Please include a friendly fox and a glowing lantern." />
                      </div>

                      {selectedProfile && selectedProfileStories.length > 0 && (
                        <div className="rounded-xl2 border border-white/10 bg-card p-4">
                          <div className="mb-1 font-bold text-star">{getSeriesLabel(selectedProfile)}</div>
                          <div className="text-sm text-muted">
                            {selectedProfileStories.length} saved episode{selectedProfileStories.length === 1 ? '' : 's'} in this story world.
                          </div>
                        </div>
                      )}

                      {!isSubscribed && (
                        <div className="rounded-xl2 border border-moon/25 bg-card p-4">
                          <div className="mb-1 font-bold text-moon">Free stories used: {storiesGenerated}/3</div>
                          <div className="mb-3 text-sm text-muted">After 3 stories, upgrade to Premium for unlimited stories, story series, narration, and up to 3 child profiles.</div>
                          {storiesGenerated >= 3 && <button onClick={startCheckout} className="rounded-full bg-gradient-to-br from-moon2 to-moon px-5 py-3 text-sm font-extrabold text-night">Subscribe — £5/mo</button>}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button
                          disabled={!selectedProfile || loadingStory}
                          onClick={() => handleGenerateStory(false)}
                          className="rounded-full bg-gradient-to-br from-moon2 to-moon px-8 py-4 text-base font-extrabold text-night shadow-moon transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loadingStory ? 'Generating your story...' : 'Generate story ✨'}
                        </button>

                        <button
                          disabled={!selectedProfile || loadingStory}
                          onClick={() => handleGenerateStory(true)}
                          className="rounded-full border border-purple2/40 bg-card px-6 py-4 text-base font-bold text-purple3 transition hover:border-purple2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          ⚡ Auto next episode
                        </button>
                      </div>
                    </div>

                    {currentStory && (
                      <div className="mt-8 rounded-xl2 border border-white/10 bg-card p-6">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex items-start gap-4">
                            {currentStory.cover_image ? (
                              <img
                                src={currentStory.cover_image}
                                alt={currentStory.title}
                                className="h-20 w-20 rounded-xl object-cover border border-white/10 bg-night3"
                              />
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-night3 text-3xl">
                                📖
                              </div>
                            )}

                            <div>
                              <div className="font-display text-3xl text-moon">{currentStory.title}</div>
                              <div className="text-sm text-muted">
                                {currentStory.child_avatar} {currentStory.child_name} · {currentStory.theme} · Episode {currentStory.episode_number || 1} · {formatStoryDate(currentStory.created_at)}
                              </div>
                              {selectedProfile?.companion_name && (
                                <div className="mt-1 text-xs text-purple3">
                                  Companion: {selectedProfile.companion_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-5"><StoryParagraphs text={currentStory.body} /></div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button onClick={saveCurrentStory} className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2.5 text-sm font-bold text-white">💾 Save to library</button>
                          <button onClick={() => handleGenerateStory(false)} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-text">🔄 Generate another</button>
                          <button onClick={() => handleGenerateStory(true)} className="rounded-full border border-purple2/40 px-5 py-2.5 text-sm font-bold text-purple3">⚡ Next episode</button>
                          <button
                            onClick={() => speakStory({ ...currentStory, id: currentStory.id || currentStory.title })}
                            className="rounded-full border border-moon/30 bg-moon/10 px-5 py-2.5 text-sm font-bold text-moon"
                          >
                            {speakingStoryId === (currentStory.id || currentStory.title) ? '🔊 Playing...' : '🔊 Voice narration'}
                          </button>
                          {speakingStoryId === (currentStory.id || currentStory.title) && (
                            <button onClick={stopSpeaking} className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral">⏹ Stop</button>
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {selectedTab === 'library' && (
                  <section>
                    <h2 className="mb-1 font-display text-3xl text-moon">Story library</h2>
                    <p className="mb-6 text-sm leading-6 text-muted">Saved bedtime stories live here as ongoing episodes and story series.</p>

                    {!isSubscribed ? (
                      <div className="rounded-xl2 border border-moon/25 bg-card p-10 text-center">
                        <div className="mb-3 text-5xl">📚</div>
                        <div className="mb-2 font-bold text-star">Story library is Premium</div>
                        <div className="mb-4 text-sm text-muted">Upgrade to unlock saved episodes, series covers, continuity, and voice narration.</div>
                        <button onClick={startCheckout} className="rounded-full bg-gradient-to-br from-moon2 to-moon px-5 py-3 text-sm font-extrabold text-night">Upgrade to Premium</button>
                      </div>
                    ) : library.length === 0 ? (
                      <div className="rounded-xl2 border border-white/10 bg-card p-10 text-center">
                        <div className="mb-3 text-5xl">📚</div>
                        <div className="mb-2 font-bold text-star">Your library is empty</div>
                        <div className="mb-4 text-sm text-muted">Generate a story and save it — it will live here as part of your child’s ongoing story world.</div>
                        <button onClick={() => setSelectedTab('generate')} className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-bold text-white">Generate first story →</button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {groupedLibrary.map((series) => {
                          const first = series[0];
                          const seriesProfile = profiles.find((p) => p.id === first?.child_id);
                          const seriesTitle = seriesProfile ? getSeriesLabel(seriesProfile) : `${first?.child_name || 'Story'} Adventures`;

                          return (
                            <div key={first?.series_id || first?.id} className="rounded-xl2 border border-white/10 bg-card p-5">
                              <div className="mb-5 flex items-center gap-4">
                                {first?.cover_image ? (
                                  <img
                                    src={first.cover_image}
                                    alt={seriesTitle}
                                    className="h-20 w-20 rounded-xl object-cover border border-white/10 bg-night3"
                                  />
                                ) : (
                                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-night3 text-3xl">
                                    {STORY_ICONS[0]}
                                  </div>
                                )}
                                <div>
                                  <div className="font-display text-2xl text-moon">{seriesTitle}</div>
                                  <div className="text-sm text-muted">
                                    {series.length} episode{series.length === 1 ? '' : 's'} · {first?.child_avatar} {first?.child_name}
                                  </div>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {series.map((story) => {
                                  const libraryIndex = library.findIndex((item) => item.id === story.id);
                                  return (
                                    <button
                                      key={story.id}
                                      onClick={() => setStoryModalIndex(libraryIndex)}
                                      className="rounded-xl2 border border-white/10 bg-night3/40 p-4 text-left transition hover:-translate-y-0.5 hover:border-purple2/40"
                                    >
                                      {story.cover_image ? (
                                        <img
                                          src={story.cover_image}
                                          alt={story.title}
                                          className="mb-3 h-36 w-full rounded-lg object-cover border border-white/10 bg-night3"
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
                                      <div className="mb-3 text-sm text-purple3">{story.child_avatar} {story.child_name}</div>
                                      <div className="mb-4 line-clamp-3 text-sm leading-6 text-muted">{story.body}</div>
                                      <div className="text-xs text-muted">{formatStoryDate(story.created_at)}</div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                )}

                {selectedTab === 'profiles' && (
                  <section>
                    <h2 className="mb-1 font-display text-3xl text-moon">Children</h2>
                    <p className="mb-6 text-sm leading-6 text-muted">Manage child profiles, avatars, ages, interests, and recurring companions.</p>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {profiles.map((profile) => (
                        <div key={profile.id} className="relative rounded-xl2 border border-white/10 bg-card p-5 text-center">
                          <button onClick={() => removeProfile(profile.id)} className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-coral/15 text-xs text-coral">✕</button>
                          <div className="mb-2 text-5xl">{profile.avatar}</div>
                          <div className="text-base font-extrabold text-star">{profile.name}</div>
                          <div className="text-xs text-muted">{profile.age} years old</div>
                          {profile.interests && <div className="mt-1 text-xs italic text-purple3">Loves: {profile.interests}</div>}
                          {profile.companion_name && (
                            <div className="mt-3 rounded-lg border border-white/10 bg-night3/60 p-3 text-left">
                              <div className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-moon">Companion</div>
                              <div className="text-sm font-bold text-star">{profile.companion_name}</div>
                              <div className="text-xs text-muted">
                                {profile.companion_type || 'friend'}{profile.companion_trait ? ` · ${profile.companion_trait}` : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {profiles.length < maxProfiles && (
                        <button onClick={() => setProfileModalOpen(true)} className="rounded-xl2 border-2 border-dashed border-white/15 p-5 text-center text-muted transition hover:border-purple hover:text-text">
                          <div className="mb-2 text-4xl">➕</div>
                          <div className="font-bold">Add child</div>
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {selectedTab === 'account' && (
                  <section>
                    <h2 className="mb-1 font-display text-3xl text-moon">Account</h2>
                    <p className="mb-6 text-sm leading-6 text-muted">View your plan, usage, and billing controls.</p>
                    {loadingAccount ? (
                      <div className="text-sm text-muted">Loading account...</div>
                    ) : (
                      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
                        <div className="rounded-xl2 border border-white/10 bg-card p-6">
                          <div className="mb-5 grid grid-cols-3 gap-4">
                            <StatBox label="Stories" value={storiesGenerated} />
                            <StatBox label="Saved" value={library.length} />
                            <StatBox label="Children" value={profiles.length} />
                          </div>
                          <InfoRow label="Name" value={userRecord?.name || user?.user_metadata?.name || '—'} />
                          <InfoRow label="Email" value={user?.email || '—'} />
                          <InfoRow label="Member since" value={accountSince} />
                          <div className="mt-6 flex flex-wrap gap-3">
                            <button onClick={signOut} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-text">Sign out</button>
                            {isSubscribed && <button onClick={openBillingPortal} className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2.5 text-sm font-bold text-white">Manage billing</button>}
                          </div>
                          <div className="mt-8 border-t border-coral/15 pt-6">
                            <div className="mb-2 text-sm font-extrabold text-coral">Danger zone</div>
                            <div className="mb-4 text-sm leading-6 text-muted">Permanently deletes your account, all child profiles, and all saved stories. This cannot be undone.</div>
                            <button onClick={handleDeleteAccount} className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral">Delete my account</button>
                          </div>
                        </div>

                        <div className="rounded-xl2 border border-white/10 bg-card p-6">
                          <div className="mb-1 text-sm font-extrabold uppercase tracking-[0.06em] text-purple3">Current plan</div>
                          <div className="mb-2 font-display text-2xl text-star">{isSubscribed ? 'Premium Plan' : 'Free Plan'}</div>
                          <div className="mb-4 text-4xl font-extrabold text-moon">{isSubscribed ? '£5' : '£0'}<span className="text-sm font-normal text-muted">/month</span></div>
                          <div className="space-y-2 text-sm text-text">
                            {isSubscribed ? (
                              <>
                                <div>✓ Unlimited stories every night</div>
                                <div>✓ Up to 3 child profiles</div>
                                <div>✓ Story series library with cover images</div>
                                <div>✓ Auto next episode + narration</div>
                              </>
                            ) : (
                              <>
                                <div>✓ 3 free stories to try</div>
                                <div className="opacity-40">✗ Story library & series</div>
                                <div className="opacity-40">✗ Auto next episode</div>
                                <div className="opacity-40">✗ Voice narration & multiple children</div>
                              </>
                            )}
                          </div>
                          <button onClick={isSubscribed ? openBillingPortal : startCheckout} className={classNames('mt-6 w-full rounded-full px-5 py-3 text-sm font-bold', isSubscribed ? 'bg-white/10 text-text' : 'bg-gradient-to-br from-moon2 to-moon text-night')}>
                            {isSubscribed ? 'Manage subscription' : '✨ Upgrade to Premium — £5/month'}
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </main>
            </div>
          </div>
        )}

        {profileModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-lg rounded-xl2 border border-white/10 bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-display text-2xl text-moon">Add child profile</div>
                <button onClick={() => setProfileModalOpen(false)} className="text-muted">✕</button>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Name</label>
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
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Age</label>
                  <select value={profileForm.age} onChange={(e) => setProfileForm((prev) => ({ ...prev, age: Number(e.target.value) }))} className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2">
                    {Array.from({ length: 10 }, (_, index) => index + 3).map((age) => <option key={age} value={age}>{age}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Interests</label>
                  <input value={profileForm.interests} onChange={(e) => setProfileForm((prev) => ({ ...prev, interests: e.target.value }))} className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2" placeholder="dragons, stars, foxes" />
                </div>
              </div>

              <div className="mb-4 rounded-xl2 border border-white/10 bg-night3/40 p-4">
                <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-moon">Recurring companion / sidekick</div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Companion name</label>
                    <input value={profileForm.companion_name} onChange={(e) => setProfileForm((prev) => ({ ...prev, companion_name: e.target.value }))} className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2" placeholder="Zara" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Companion type</label>
                    <input value={profileForm.companion_type} onChange={(e) => setProfileForm((prev) => ({ ...prev, companion_type: e.target.value }))} className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2" placeholder="dragon, robot, fairy" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Companion personality</label>
                  <input value={profileForm.companion_trait} onChange={(e) => setProfileForm((prev) => ({ ...prev, companion_trait: e.target.value }))} className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2" placeholder="brave but easily startled" />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">Avatar</label>
                <div className="grid grid-cols-5 gap-3">
                  {AVATARS.map((avatar) => (
                    <button key={avatar} onClick={() => setProfileForm((prev) => ({ ...prev, avatar }))} className={classNames('rounded-sm2 border px-2 py-3 text-2xl transition', profileForm.avatar === avatar ? 'border-moon bg-moon/10' : 'border-white/10 bg-night3')}>
                      {avatar}
                    </button>
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

              <div className="flex justify-end gap-3">
                <button onClick={() => setProfileModalOpen(false)} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-text">Cancel</button>
                <button onClick={saveProfile} className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2.5 text-sm font-bold text-white">Add child ✓</button>
              </div>
            </div>
          </div>
        )}

        {storyModalIndex !== null && library[storyModalIndex] && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl2 border border-white/10 bg-card p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {library[storyModalIndex].cover_image ? (
                    <img
                      src={library[storyModalIndex].cover_image}
                      alt={library[storyModalIndex].title}
                      className="h-20 w-20 rounded-xl object-cover border border-white/10 bg-night3"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-night3 text-3xl">
                      📖
                    </div>
                  )}

                  <div>
                    <div className="font-display text-3xl text-moon">{library[storyModalIndex].title}</div>
                    <div className="text-sm text-muted">
                      {library[storyModalIndex].child_avatar} {library[storyModalIndex].child_name} · {library[storyModalIndex].theme} · Episode {library[storyModalIndex].episode_number || 1} · {formatStoryDate(library[storyModalIndex].created_at)}
                    </div>
                  </div>
                </div>

                <button onClick={() => setStoryModalIndex(null)} className="text-muted">✕</button>
              </div>

              <div className="space-y-5"><StoryParagraphs text={library[storyModalIndex].body} /></div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => speakStory(library[storyModalIndex])}
                  className="rounded-full border border-moon/30 bg-moon/10 px-5 py-2.5 text-sm font-bold text-moon"
                >
                  {speakingStoryId === library[storyModalIndex].id ? '🔊 Playing...' : '🔊 Voice narration'}
                </button>

                {speakingStoryId === library[storyModalIndex].id && (
                  <button onClick={stopSpeaking} className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral">⏹ Stop</button>
                )}

                <button onClick={() => setStoryModalIndex(null)} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-text">Close</button>
                <button onClick={() => removeStory(storyModalIndex)} className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral">Delete</button>
              </div>
            </div>
          </div>
        )}

        <Toast toast={toast} />
      </div>
    </div>
  );
}

function OptionGroup({ title, options, value, onChange }) {
  return (
    <div>
      <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">{title}</div>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const active = option === value;
          return (
            <button key={option} onClick={() => onChange(option)} className={classNames('rounded-full border px-4 py-2 text-sm font-bold capitalize transition', active ? 'border-moon bg-moon/10 text-moon' : 'border-white/10 bg-card text-text hover:border-purple2')}>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-sm2 border border-white/5 bg-night3/60 p-4 text-center">
      <div className="text-3xl font-extrabold text-moon">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3 text-sm last:border-b-0">
      <div className="text-muted">{label}</div>
      <div className="font-bold text-text">{value}</div>
    </div>
  );
}