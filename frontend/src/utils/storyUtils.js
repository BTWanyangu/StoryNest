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
  free: { id: 'free', label: '', displayPrice: '', stories: 0, children: 0, isPaid: false },
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


function normalizeMoralDirection(moral) {
  if (Array.isArray(moral)) {
    return moral.filter(Boolean).join(', ');
  }

  return moral || '';
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
  return { title, body, child_name: profile.name, child_avatar: profile.avatar, child_id: profile.id, theme, moral: normalizeMoralDirection(moral) || null, created_at: new Date().toISOString(), series_id: seriesId, episode_number: nextEpisode, story_language: language, voice_role: selectedVoiceRole, cover_image: makeStoryCover(theme, title) };
}

export function buildPrompt(
  profile,
  theme,
  length,
  moral,
  wish,
  previousStories = [],
  autoMode = false,
  language = 'English'
) {
  const moralDirection = normalizeMoralDirection(moral);

  const siblingBlock = profile.sibling_name
    ? `
SIBLING IN THE STORY: ${profile.sibling_name}, aged ${
        profile.sibling_age || 'unknown'
      }, who is ${
        profile.sibling_relationship || 'a sibling'
      }.
Weave them in as a companion character.
`
    : '';

  const companionBlock = profile.companion_name
    ? `
RECURRING COMPANION: ${profile.companion_name} is ${
        [
          profile.companion_type,
          profile.companion_trait,
        ]
          .filter(Boolean)
          .join(', ') || 'a beloved recurring companion'
      }.
This companion appears in all of ${profile.name}'s stories.
Reference them as someone already known and loved.
`
    : '';

  const todayMomentBlock = wish
    ? `
TONIGHT'S SPECIAL DETAIL:
Something that happened in ${profile.name}'s real day today —
weave this naturally into the story as the inciting incident
or an important emotional moment:

"${wish}"
`
    : '';

  const continuityBlock = previousStories.length
    ? `
SERIES CONTINUITY:
These are previous adventures from ${profile.name}'s existing story world.
Maintain continuity, emotional memory, recurring themes,
and internal consistency.

${previousStories
  .map(
    (story, index) => `
PREVIOUS EPISODE ${index + 1}
Title: ${story.title}

Summary:
${story.body.slice(0, 1200)}
`
  )
  .join('\n')}

AUTO-GENERATE MODE:
${autoMode ? 'YES — continue the ongoing story naturally.' : 'NO'}

CONSISTENCY RULES:
- Reference past adventures naturally
- Keep recurring characters emotionally consistent
- Let the world evolve naturally
- Never repeat the same gimmick or conflict
- Make this feel like the next real episode
`
    : `
This is the first story in a new Moonspun story world for ${profile.name}.

AUTO-GENERATE MODE:
${
  autoMode
    ? 'Treat this as the beginning of a continuing story series.'
    : 'Create a memorable standalone bedtime adventure.'
}
`;

  return `You are Moonspun — a master storyteller who crafts deeply personal bedtime
adventures for children. Your stories feel as though they were written by a
gifted human author who knows the child intimately. You write with warmth, wit,
and wonder. You never mention AI, algorithms, or generation. You never break the
magic. Every story you write is the best story that child has ever heard.

CRAFT RULES — follow these without exception:

1. OPEN WITH A BANG.
Your first sentence must be vivid, surprising, delightful,
or emotionally gripping enough that a tired parent instantly
wants to keep reading aloud.

Never open with:
- "${profile.name} was getting ready for bed"
- weather
- waking up
- "Once upon a time"

Open in the middle of something happening.

2. USE THE CHILD'S NAME NATURALLY.
Do not overuse it.
Use it like a skilled novelist would:
sparingly and emotionally.

3. WEAVE INTERESTS IN, DON'T ANNOUNCE THEM.
If the child loves dinosaurs,
the story should feel built for a dinosaur-loving child —
not like a template with dinosaurs inserted.

4. WRITE IN SCENES, NOT SUMMARIES.
Show moments happening.
Scenes create wonder.

5. EVERY STORY NEEDS AN EMOTIONAL ARC.
The child must face something,
grow through it emotionally,
and reach a satisfying resolution.

6. THE ENDING IS SACRED.
The final paragraph must soften gently toward sleep.
The emotional tone should become calmer,
warmer,
quieter,
and emotionally safe.

7. VOCABULARY MUST MATCH THE CHILD'S AGE.

Age 3–4:
Simple words, repetition, rhythm.

Age 5–6:
Clearer structure and richer vocabulary.

Age 7–9:
Humour, metaphor, layered emotion.

Age 10+:
Near-adult prose and emotional depth.

8. USE ONE UNEXPECTED DETAIL.
Something strange, beautiful, funny,
or unforgettable that could only exist in THIS story.

NEVER DO ANY OF THE FOLLOWING:
— Open with "Once upon a time"
— Open with waking up or bedtime routines
— Use "And so, ${profile.name} learned that..."
— State morals directly
— Describe the child as "special" or "brave"
— Use the words "magical", "wonderful", or "amazing"
— Mention AI, prompts, generation, or personalisation
— Write dialogue that sounds like adults teaching lessons
— Make the story feel generic

Write a bedtime story for the following child:

CHILD'S NAME: ${profile.name}

AGE: ${profile.age}

INTERESTS:
${profile.interests || 'None given'}

TONIGHT'S THEME:
${theme}

STORY LENGTH:
${length}

LANGUAGE:
Write the story entirely in ${language},
using vocabulary appropriate for a ${profile.age}-year-old child.

${siblingBlock}

${companionBlock}

${todayMomentBlock}

${
  moralDirection
    ? `
SOFT MORAL DIRECTIONS:
The emotional undercurrent may gently reward qualities related to:
${moralDirection}

Do NOT state the morals explicitly.
`
    : ''
}

${continuityBlock}

Remember:
This should feel like the best bedtime story this child has ever heard.

OUTPUT FORMAT:
— Story title on the first line
— One blank line
— Story in flowing paragraphs
— One blank line between paragraphs
— No commentary before or after the story
— The story itself is the only output

After the final paragraph add:

---
Tonight's word:
[one word in ${language}] ([phonetic pronunciation])

— [a gentle, beautiful one-sentence definition written warmly for a child]`;
}