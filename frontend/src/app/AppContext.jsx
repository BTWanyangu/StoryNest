// src/app/AppContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AVATARS, LENGTHS, MORALS, STORY_ICONS } from '../constants';
import { supabase } from '../lib/supabase';
import {
  createCheckoutSession,
  createPortalSession,
  deleteAccountApi,
  generateStory,
  getSubscriptionStatus,
  syncStripeSuccess,
} from '../lib/api';
import {
  buildPrompt,
  classNames,
  formatSince,
  getPlanMeta,
  getSeriesLabel,
  initialForm,
  initialProfile,
  LANGUAGE_OPTIONS,
  makeStoryCover,
  parseStory,
  PLAN_META,
  PROFILE_AVATARS,
  THEME_OPTIONS,
  VOICE_ROLE_OPTIONS,
} from '../utils/storyUtils';

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

const APP_HOME_PATH = '/app/generate';
const LOGIN_PATH = '/login';
const SIGNUP_PATH = '/signup';
const RESET_PASSWORD_PATH = '/reset-password';

function getAppBaseUrl() {
  return window.location.origin.replace(/\/$/, '');
}

function getLoginRedirectUrl() {
  return `${getAppBaseUrl()}${LOGIN_PATH}`;
}

function getResetPasswordRedirectUrl() {
  return `${getAppBaseUrl()}${RESET_PASSWORD_PATH}`;
}

function isAuthPage(pathname) {
  return ['/login', '/signup', '/forgot-password'].includes(pathname);
}

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(initialForm);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(false);

  const [session, setSession] = useState(null);
  const [userRecord, setUserRecord] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [library, setLibrary] = useState([]);

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
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [storyModalIndex, setStoryModalIndex] = useState(null);

  const [profileForm, setProfileForm] = useState(initialProfile);
  const [profileError, setProfileError] = useState('');
  const [consentError, setConsentError] = useState('');

  const [toast, setToast] = useState(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(true);

  const [subscription, setSubscription] = useState({
    plan: 'free',
    status: 'none',
  });

  const [speakingStoryId, setSpeakingStoryId] = useState(null);
  const [narrationPaused, setNarrationPaused] = useState(false);

  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState('pro');
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState(
    () => localStorage.getItem('moonspun_pending_checkout_plan') || ''
  );
  const [checkoutClientSecret, setCheckoutClientSecret] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const [selectedVoiceRole, setSelectedVoiceRole] = useState(() => {
    const saved = localStorage.getItem('moonspun_voice_role');
    return saved === 'male' || saved === 'male' ? 'male' : 'female';
  });

  const narrationStoppedRef = useRef(false);

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

  const selectedProfileStories = useMemo(() => {
    if (!selectedProfile) return [];
    return library.filter((item) => item.child_id === selectedProfile.id);
  }, [library, selectedProfile]);

  const groupedLibrary = useMemo(() => {
    const groups = {};

    library.forEach((story) => {
      const key = story.series_id || story.child_id || story.id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(story);
    });

    return Object.values(groups)
      .map((stories) =>
        [...stories].sort(
          (a, b) => (a.episode_number || 0) - (b.episode_number || 0)
        )
      )
      .sort(
        (a, b) =>
          new Date(b[0]?.created_at || 0) - new Date(a[0]?.created_at || 0)
      );
  }, [library]);

  const accountSince = user ? formatSince(user.created_at) : '—';

  const firstName =
    userRecord?.name?.split(' ')[0] ||
    user?.user_metadata?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';

  function showToast(message, bg) {
    setToast({ message, bg });
  }

  function openAddProfileModal() {
    setEditingProfileId(null);
    setProfileForm(initialProfile);
    setProfileError('');
    setConsentError('');
    setProfileModalOpen(true);
  }

  function openEditProfileModal(profile) {
    if (!profile) return;

    setEditingProfileId(profile.id);
    setProfileForm({
      name: profile.name || '',
      age: profile.age || 7,
      interests: profile.interests || '',
      avatar: profile.avatar || PROFILE_AVATARS[0],
      consent: true,
      companion_name: profile.companion_name || '',
      companion_type: profile.companion_type || '',
      companion_trait: profile.companion_trait || '',
      sibling_name: profile.sibling_name || '',
      sibling_age: profile.sibling_age || '',
      sibling_relationship: profile.sibling_relationship || '',
    });
    setProfileError('');
    setConsentError('');
    setProfileModalOpen(true);
  }

  function closeProfileModal() {
    setProfileModalOpen(false);
    setEditingProfileId(null);
    setProfileForm(initialProfile);
    setProfileError('');
    setConsentError('');
  }

  function toggleTheme(theme) {
    setSelectedThemes((prev) => {
      if (prev.includes(theme)) {
        return prev.length === 1
          ? prev
          : prev.filter((item) => item !== theme);
      }

      return [...prev, theme];
    });
  }

  function stopSpeaking() {
    narrationStoppedRef.current = true;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setSpeakingStoryId(null);
    setNarrationPaused(false);
  }

  function pauseSpeaking() {
    if (
      'speechSynthesis' in window &&
      speakingStoryId &&
      !window.speechSynthesis.paused
    ) {
      window.speechSynthesis.pause();
      setNarrationPaused(true);
    }
  }

  function resumeSpeaking() {
    if (
      'speechSynthesis' in window &&
      speakingStoryId &&
      window.speechSynthesis.paused
    ) {
      window.speechSynthesis.resume();
      setNarrationPaused(false);
    }
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
        ? [
            'male',
            'man',
            'david',
            'daniel',
            'george',
            'fred',
            'alex',
            'thomas',
            'mark',
            'james',
            'arthur',
          ]
        : [
            'female',
            'woman',
            'samantha',
            'susan',
            'victoria',
            'karen',
            'zira',
            'anna',
            'sara',
            'joanna',
            'emma',
          ];

    const languageMatches = voices.filter((voice) => {
      const voiceLang = voice.lang?.toLowerCase() || '';
      return voiceLang === targetLang || voiceLang.startsWith(baseLang);
    });

    const roleMatch = languageMatches.find((voice) =>
      roleHints.some((hint) => voice.name?.toLowerCase().includes(hint))
    );

    if (roleMatch) return roleMatch;
    if (languageMatches.length) return languageMatches[0];

    return (
      voices.find((voice) => voice.lang?.toLowerCase().startsWith('en')) ||
      voices[0]
    );
  }

  function waitForVoices(timeout = 1800) {
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
    const rawVoiceRole = story.voice_role || selectedVoiceRole;
    const narrationVoiceRole =
      rawVoiceRole === 'male' || rawVoiceRole === 'male' ? 'male' : 'female';

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const speakText = (text, bestVoice) =>
      new Promise((resolve) => {
        if (narrationStoppedRef.current) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getSpeechLang(narrationLanguage);
        utterance.rate = 0.74;
        utterance.pitch = narrationVoiceRole === 'male' ? 0.82 : 1.03;
        utterance.volume = 0.92;

        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang || utterance.lang;
        }

        utterance.onend = resolve;
        utterance.onerror = resolve;

        window.speechSynthesis.speak(utterance);
      });

    try {
      stopSpeaking();
      await waitForVoices();

      narrationStoppedRef.current = false;
      setNarrationPaused(false);

      const bestVoice = pickBestVoice(narrationLanguage, narrationVoiceRole);

      const paragraphs = String(story.body || '')
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

      setSpeakingStoryId(storyId);

      await sleep(160);
      await speakText(story.title, bestVoice);
      await sleep(650);

      for (const paragraph of paragraphs) {
        if (narrationStoppedRef.current) break;
        await speakText(paragraph, bestVoice);
        await sleep(420);
      }

      if (!narrationStoppedRef.current) {
        setSpeakingStoryId(null);
        setNarrationPaused(false);
      }
    } catch (error) {
      console.error(error);
      setSpeakingStoryId(null);
      setNarrationPaused(false);
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

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const openResetPasswordScreen = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const path = window.location.pathname;
      const code = searchParams.get('code');

      const isRecoveryLink =
        path === RESET_PASSWORD_PATH ||
        searchParams.get('type') === 'recovery' ||
        hashParams.get('type') === 'recovery' ||
        searchParams.get('password_recovery') === 'true' ||
        Boolean(hashParams.get('access_token') && hashParams.get('refresh_token'));

      if (!isRecoveryLink) return;

      setPasswordRecoveryMode(true);
      setAuthMode('reset');
      setAuthError('');
      setAuthNotice('Enter your new password below.');

      navigate(RESET_PASSWORD_PATH, { replace: true });

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setAuthError(
            error.message ||
              'The reset link is invalid or has expired. Please request a new one.'
          );
          return;
        }

        window.history.replaceState({}, '', RESET_PASSWORD_PATH);
      }
    };

    openResetPasswordScreen();
  }, [navigate]);

  useEffect(() => {
    let ignore = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!ignore) {
        setSession(data.session ?? null);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);

      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryMode(true);
        setAuthMode('reset');
        setAuthError('');
        setAuthNotice('Enter your new password below.');
        navigate(RESET_PASSWORD_PATH, { replace: true });
      }

      if (event === 'SIGNED_IN' && nextSession && isAuthPage(window.location.pathname)) {
        navigate(APP_HOME_PATH, { replace: true });
      }
    });

    return () => {
      ignore = true;
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    async function bootstrap() {
      if (!user || !token) {
        setUserRecord(null);
        setProfiles([]);
        setLibrary([]);
        setSubscription({ plan: 'free', status: 'none' });
        setLoadingAccount(false);
        return;
      }

      if (passwordRecoveryMode || authMode === 'reset') {
        setLoadingAccount(false);
        return;
      }

      setLoadingAccount(true);

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

          setUserRecord((prev) =>
            prev ? { ...prev, plan: status.plan } : prev
          );
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

          window.history.replaceState({}, '', APP_HOME_PATH);
          navigate(APP_HOME_PATH, { replace: true });
        } catch (error) {
          console.error(error);
        } finally {
          localStorage.removeItem('moonspun_pending_checkout_plan');
          setPendingCheckoutPlan('');
        }
      } else if (isAuthPage(location.pathname)) {
        navigate(APP_HOME_PATH, { replace: true });
      }

      setLoadingAccount(false);
    }

    bootstrap();
  }, [
    token,
    user?.id,
    passwordRecoveryMode,
    authMode,
    navigate,
    location.pathname,
  ]);

  useEffect(() => {
    if (
      !token ||
      !pendingCheckoutPlan ||
      loadingAccount ||
      passwordRecoveryMode ||
      authMode === 'reset' ||
      checkoutModalOpen
    ) {
      return;
    }

    const activePlan = subscription.plan || userRecord?.plan || 'free';

    if (activePlan === 'pro' || activePlan === 'pro_unlimited') {
      localStorage.removeItem('moonspun_pending_checkout_plan');
      setPendingCheckoutPlan('');
      navigate(APP_HOME_PATH, { replace: true });
      return;
    }

    const planToOpen = pendingCheckoutPlan;

    localStorage.removeItem('moonspun_pending_checkout_plan');
    setPendingCheckoutPlan('');
    setSelectedCheckoutPlan(planToOpen);

    startCheckout(planToOpen);
  }, [
    token,
    pendingCheckoutPlan,
    loadingAccount,
    passwordRecoveryMode,
    authMode,
    checkoutModalOpen,
    subscription.plan,
    userRecord?.plan,
    navigate,
  ]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  async function handleAuthSubmit() {
    const { email, password, confirmPassword, name, parentConsent } = authForm;

    setAuthError('');
    setAuthNotice('');

    if (authMode === 'forgot') {
      if (!email) {
        setAuthError('Please enter your email address');
        return;
      }

      if (!email.includes('@')) {
        setAuthError('Please enter a valid email');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getResetPasswordRedirectUrl(),
      });

      if (error) {
        if (error.status === 429) {
          setAuthError('Too many reset attempts. Please wait a few minutes before trying again.');
          return;
        }

        setAuthError(error.message);
        return;
      }

      setAuthNotice('Password reset link sent. Please check your email.');
      return;
    }

    if (authMode === 'reset') {
      if (!password || !confirmPassword) {
        setAuthError('Please enter and confirm your new password');
        return;
      }

      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        setAuthError('Passwords do not match');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setAuthError(error.message);
        return;
      }

      setAuthForm(initialForm);
      setPasswordRecoveryMode(false);
      setAuthMode('login');
      setAuthNotice('Password updated successfully. Please sign in with your new password.');

      await supabase.auth.signOut();

      navigate(LOGIN_PATH, { replace: true });
      return;
    }

    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setAuthError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    if (authMode === 'signup' && !parentConsent) {
      setAuthError('Please confirm you are a parent or guardian');
      return;
    }

    const payload =
      authMode === 'signup'
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: getLoginRedirectUrl(),
            },
          })
        : await supabase.auth.signInWithPassword({
            email,
            password,
          });

    if (payload.error) {
      setAuthError(payload.error.message);
      return;
    }

    if (authMode === 'signup') {
      const chosenPlan = pendingCheckoutPlan || selectedCheckoutPlan;

      setAuthNotice(
        `Account created. Please check your email and verify your address before signing in. After signing in, your ${
          chosenPlan === 'pro_unlimited' ? 'Pro Unlimited' : 'Pro'
        } trial checkout will open automatically.`
      );

      setAuthMode('login');
      navigate(LOGIN_PATH, { replace: true });
    } else {
      navigate(APP_HOME_PATH, { replace: true });
    }

    setAuthForm(initialForm);
  }

  async function signOut() {
    stopSpeaking();
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  }

  async function saveProfile() {
    if (!profileForm.name.trim()) {
      setProfileError("Please enter your child's name");
      return;
    }

    if (!profileForm.consent && !editingProfileId) {
      setConsentError('Please tick the consent box');
      return;
    }

    if (!editingProfileId && profiles.length >= maxProfiles) {
      showToast(
        isPaidPlan
          ? `Maximum of ${maxProfiles} children reached for your plan.`
          : 'Please start your 3-day trial to add child profiles.',
        '#ff6b6b'
      );
      return;
    }

    const payload = {
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
    };

    const request = editingProfileId
      ? supabase
          .from('children')
          .update(payload)
          .eq('id', editingProfileId)
          .eq('user_id', user.id)
          .select()
          .single()
      : supabase
          .from('children')
          .insert({
            user_id: user.id,
            ...payload,
            consent_given_at: new Date().toISOString(),
          })
          .select()
          .single();

    const { data, error } = await request;

    if (error) {
      showToast(
        editingProfileId ? 'Could not update profile' : 'Could not save profile',
        '#ff6b6b'
      );
      return;
    }

    if (editingProfileId) {
      setProfiles((prev) =>
        prev.map((item) => (item.id === editingProfileId ? data : item))
      );

      showToast(`${data.name}'s profile updated ✨`);
    } else {
      setProfiles((prev) => [...prev, data]);
      setSelectedProfileId(data.id);
      showToast(`${data.name} added! Ready for tonight's story 🌙`);
    }

    closeProfileModal();
  }

  async function removeProfile(profileId) {
    const profile = profiles.find((item) => item.id === profileId);

    if (!profile) return;

    if (!window.confirm(`Remove ${profile.name}'s profile? This won't delete saved stories.`)) {
      return;
    }

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
        currentPlan === 'pro'
          ? 'You have reached your 50-story monthly allowance. Upgrade to Pro Unlimited.'
          : 'Story limit reached.',
        '#ff6b6b'
      );
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

      const story = {
        ...parseStory(
          data.text,
          selectedProfile,
          selectedThemes.join(', '),
          selectedMoral,
          previousStories,
          selectedLanguage,
          selectedVoiceRole
        ),
        voice_role: selectedVoiceRole,
        cover_image: makeStoryCover(
          selectedThemes.join(', '),
          selectedProfile?.name || 'Moonspun Story'
        ),
      };

      setCurrentStory(story);

      const nextCount = storiesGenerated + 1;

      const { error } = await supabase
        .from('users')
        .update({ stories_generated: nextCount })
        .eq('id', user.id);

      if (!error) {
        setUserRecord((prev) =>
          prev ? { ...prev, stories_generated: nextCount } : prev
        );
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
      (story) =>
        (story.series_id || story.child_id) ===
        (currentStory.series_id || currentStory.child_id)
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
        voice_role: selectedVoiceRole || currentStory.voice_role || 'female',
        cover_image:
          currentStory.cover_image ||
          makeStoryCover(
            currentStory.theme || selectedThemes.join(', '),
            currentStory.title
          ),
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

  function choosePlanFromLanding(planId) {
    const cleanPlanId = planId === 'pro_unlimited' ? 'pro_unlimited' : 'pro';

    setSelectedCheckoutPlan(cleanPlanId);
    setPendingCheckoutPlan(cleanPlanId);

    localStorage.setItem('moonspun_pending_checkout_plan', cleanPlanId);

    setAuthError('');
    setAuthNotice(
      `Create your account to start the ${
        cleanPlanId === 'pro_unlimited' ? 'Pro Unlimited' : 'Pro'
      } 3-day trial.`
    );

    if (token) {
      startCheckout(cleanPlanId);
      return;
    }

    setAuthMode('signup');
    navigate(SIGNUP_PATH);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function startCheckout(planId = selectedCheckoutPlan) {
    if (!token) {
      choosePlanFromLanding(planId);
      return;
    }

    try {
      setSelectedCheckoutPlan(planId);

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

      throw new Error(
        'Checkout session was created but no checkout client secret was returned.'
      );
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
    if (!window.confirm('This will permanently delete your account and all data. Are you sure?')) {
      return;
    }

    try {
      stopSpeaking();
      await deleteAccountApi(token);
      await supabase.auth.signOut();
      showToast('Account deleted');
      navigate('/', { replace: true });
    } catch (error) {
      showToast(error.message, '#ff6b6b');
    }
  }

  const value = {
    AVATARS,
    LENGTHS,
    MORALS,
    STORY_ICONS,

    classNames,
    getSeriesLabel,

    PLAN_META,
    PROFILE_AVATARS,
    LANGUAGE_OPTIONS,
    THEME_OPTIONS,
    VOICE_ROLE_OPTIONS,

    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
    authError,
    setAuthError,
    authNotice,
    setAuthNotice,

    passwordRecoveryMode,
    setPasswordRecoveryMode,

    session,
    userRecord,
    profiles,
    library,

    selectedProfileId,
    setSelectedProfileId,

    selectedThemes,
    setSelectedThemes,
    selectedLength,
    setSelectedLength,
    selectedMoral,
    setSelectedMoral,
    wish,
    setWish,

    selectedLanguage,
    setSelectedLanguage,

    currentStory,
    setCurrentStory,

    profileModalOpen,
    setProfileModalOpen,
    editingProfileId,

    storyModalIndex,
    setStoryModalIndex,

    profileForm,
    setProfileForm,
    profileError,
    setProfileError,
    consentError,
    setConsentError,

    toast,
    loadingStory,
    loadingAccount,

    subscription,

    speakingStoryId,
    narrationPaused,

    selectedCheckoutPlan,
    setSelectedCheckoutPlan,

    checkoutClientSecret,
    setCheckoutClientSecret,
    checkoutModalOpen,
    setCheckoutModalOpen,

    selectedVoiceRole,
    setSelectedVoiceRole,

    token,
    user,

    storiesGenerated,
    currentPlan,
    planMeta,
    isPaidPlan,
    maxProfiles,
    maxStories,

    selectedProfile,
    selectedProfileStories,
    groupedLibrary,

    accountSince,
    firstName,

    showToast,

    openAddProfileModal,
    openEditProfileModal,
    closeProfileModal,
    toggleTheme,

    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    speakStory,

    handleAuthSubmit,
    signOut,

    saveProfile,
    removeProfile,

    handleGenerateStory,
    saveCurrentStory,
    removeStory,

    choosePlanFromLanding,
    startCheckout,
    openBillingPortal,
    handleDeleteAccount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}