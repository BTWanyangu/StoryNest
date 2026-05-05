export const initialForm = { email: '', password: '', confirmPassword: '', name: '', parentConsent: false };

export const initialProfile = {
  name: '', age: 7, interests: '', avatar: '👧🏽', consent: false,
  companion_name: '', companion_type: '', companion_trait: '',
  sibling_name: '', sibling_age: '', sibling_relationship: '',
};

export const PROFILE_AVATARS = [
  '👶🏻','👶🏼','👶🏽','👶🏾','👶🏿','👧🏻','👧🏼','👧🏽','👧🏾','👧🏿',
  '👦🏻','👦🏼','👦🏽','👦🏾','👦🏿','🧒🏻','🧒🏼','🧒🏽','🧒🏾','🧒🏿',
];

export const LANGUAGE_OPTIONS = [
  'English','Spanish','French','German','Mandarin (China)','Tagalog (Filipino)','Vietnamese','Arabic',
  'Korean','Russian','Portuguese','Hindi','Haitian Creole','Italian','Punjabi','Japanese','Persian / Farsi',
  'Polish','Turkish','Dutch',
];

export const THEME_OPTIONS = [
  'Dragons & mythical creatures','Space journeys','Magical adventure','Superheroes & Special powers',
  'Friendship & belonging','Animals & talking animals','Underwater & ocean adventures','Dinosaurs','Fairy tales',
  'Pirates treasure hunts','Science & inventions','Time travel & history','Robots & technology',
  'Sports & winning through team effort','Nature & environmental adventures','Dreamworld',
];

export const VOICE_ROLE_OPTIONS = [
  { value: 'female', label: 'Female voice' },
  { value: 'male', label: 'Male voice' },
];

export const PLAN_META = {
  free: { id: 'free', label: 'Free', displayPrice: '$0', stories: 3, children: 1, isPaid: false },
  pro: { id: 'pro', label: 'Pro', displayPrice: '$8.99', stories: 50, children: 2, isPaid: true },
  pro_unlimited: { id: 'pro_unlimited', label: 'Pro Unlimited', displayPrice: '$14.99', stories: Infinity, children: 6, isPaid: true },
};

export function classNames(...parts) { return parts.filter(Boolean).join(' '); }
export function getPlanMeta(plan) { return PLAN_META[plan] || PLAN_META.free; }
export function formatSince(dateValue) { return new Date(dateValue).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); }
export function formatStoryDate(dateValue) { return new Date(dateValue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
export function getSeriesLabel(profile) { if (!profile) return 'Story Series'; return profile.companion_name ? `${profile.name} & ${profile.companion_name} Adventures` : `${profile.name}'s Adventures`; }

export function getThemeCoverEmoji(theme = '') {
  const lower = theme.toLowerCase();
  if (lower.includes('dragon') || lower.includes('mythical')) return '🐉';
  if (lower.includes('space')) return '🚀';
  if (lower.includes('superhero') || lower.includes('power')) return '🦸';
  if (lower.includes('friendship') || lower.includes('belonging')) return '🤝';
  if (lower.includes('animal')) return '🦊';
  if (lower.includes('underwater') || lower.includes('ocean')) return '🐳';
  if (lower.includes('dinosaur')) return '🦕';
  if (lower.includes('fairy')) return '🏰';
  if (lower.includes('pirate') || lower.includes('treasure')) return '🏴‍☠️';
  if (lower.includes('science') || lower.includes('invention')) return '🔬';
  if (lower.includes('time travel') || lower.includes('history')) return '⏳';
  if (lower.includes('robot') || lower.includes('technology')) return '🤖';
  if (lower.includes('sports')) return '🏆';
  if (lower.includes('nature') || lower.includes('environment')) return '🌿';
  if (lower.includes('dream')) return '🌙';
  return '✨';
}

export function makeStoryCover(theme = '', title = 'Moonspun Story') {
  const emoji = getThemeCoverEmoji(theme);
  const safeTitle = String(title || 'Moonspun Story').replace(/[<&>]/g, '');
  const safeTheme = String(theme || 'Bedtime Adventure').split(',')[0].replace(/[<&>]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#19153f"/><stop offset="55%" stop-color="#2d2469"/><stop offset="100%" stop-color="#6545a8"/></linearGradient><radialGradient id="moon" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff3b0"/><stop offset="100%" stop-color="#f5c85b"/></radialGradient></defs><rect width="900" height="600" rx="44" fill="url(#g)"/><circle cx="720" cy="92" r="54" fill="url(#moon)" opacity="0.95"/><circle cx="742" cy="72" r="54" fill="#2d2469" opacity="0.88"/><rect x="86" y="92" width="728" height="416" rx="36" fill="rgba(255,255,255,0.055)" stroke="rgba(255,255,255,0.16)"/><text x="450" y="270" font-family="Inter,Arial" font-size="118" text-anchor="middle">${emoji}</text><text x="450" y="356" font-family="Inter,Arial" font-size="38" font-weight="800" fill="#fff4c6" text-anchor="middle">${safeTitle.slice(0,34)}</text><text x="450" y="408" font-family="Inter,Arial" font-size="22" fill="#d8d1ff" text-anchor="middle">${safeTheme.slice(0,48)}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function parseStory(raw, profile, theme, moral, previousStories = [], language = 'English', selectedVoiceRole = 'female') {
  const cleaned = raw.trim();
  const labeledTitleMatch = cleaned.match(/^TITLE:\s*(.+)$/im);
  let title = `${profile.name}'s Moonspun Adventure`;
  let body = cleaned;
  if (labeledTitleMatch) {
    title = labeledTitleMatch[1].trim();
    body = cleaned.replace(/^TITLE:\s*.+\n?/im, '').trim();
  } else {
    const parts = cleaned.split(/\n\s*\n/);
    if (parts.length > 1 && parts[0].trim().length < 120) { title = parts[0].trim(); body = parts.slice(1).join('\n\n').trim(); }
  }
  const nextEpisode = previousStories.length + 1;
  const seriesId = profile.child_series_id || profile.id;
  return { title, body, child_name: profile.name, child_avatar: profile.avatar, child_id: profile.id, theme, moral: moral || null, created_at: new Date().toISOString(), series_id: seriesId, episode_number: nextEpisode, story_language: language, voice_role: selectedVoiceRole, cover_image: makeStoryCover(theme, title) };
}

export function buildPrompt(profile, theme, length, moral, wish, previousStories = [], autoMode = false, language = 'English') {
  const siblingBlock = profile.sibling_name ? `\nSIBLING IN THE STORY: ${profile.sibling_name}, aged ${profile.sibling_age || 'unknown'}, who is ${profile.sibling_relationship || 'a sibling'}.\nWeave them in as a companion character.\n` : '';
  const companionBlock = profile.companion_name ? `\nRECURRING COMPANION: ${profile.companion_name} is ${[profile.companion_type, profile.companion_trait].filter(Boolean).join(', ') || 'a beloved recurring companion'}.\nThis companion appears in all of ${profile.name}'s stories. Reference them as someone already known and loved.\n` : '';
  const todayMomentBlock = wish ? `\nTONIGHT'S SPECIAL DETAIL: Something that happened in ${profile.name}'s real day today — weave this into the story naturally:\n"${wish}"\n` : '';
  const continuityBlock = previousStories.length ? `\nSERIES CONTINUITY:\n${previousStories.map((story, index) => `PREVIOUS EPISODE ${index + 1}:\nTitle: ${story.title}\nSummary:\n${story.body.slice(0, 1200)}`).join('\n\n')}\nAUTO-GENERATE MODE: ${autoMode ? 'YES' : 'NO'}\n` : `\nThis is the first story in a new Moonspun story world for ${profile.name}.\n`;
  return `You are Moonspun — a master storyteller who crafts deeply personal bedtime adventures for children. Never mention AI.\n\nWrite a bedtime story for:\nCHILD'S NAME: ${profile.name}\nAGE: ${profile.age}\nINTERESTS: ${profile.interests || 'None given'}\nTONIGHT'S THEME: ${theme}\nSTORY LENGTH: ${length}\nLANGUAGE: Write the story in ${language}.\n${siblingBlock}${companionBlock}${todayMomentBlock}${moral ? `SOFT MORAL DIRECTION: ${moral}\n` : ''}${continuityBlock}\nOUTPUT FORMAT:\nStory title on the first line, blank line, then the story. After the final paragraph add Tonight's word.`;
}