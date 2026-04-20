import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
  { code: 'zh-CN', label: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
];

const STORAGE_KEY = 'storynest_selected_language';

function applyGoogleTranslate(languageCode) {
  const combo = document.querySelector('.goog-te-combo');
  if (!combo) return false;

  combo.value = languageCode;
  combo.dispatchEvent(new Event('change'));
  return true;
}

export default function FloatingTranslator() {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  });

  const selectedMeta = useMemo(
    () => LANGUAGES.find((lang) => lang.code === selectedLanguage) || LANGUAGES[0],
    [selectedLanguage]
  );

  useEffect(() => {
    const existingScript = document.getElementById('google-translate-script');

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: LANGUAGES.map((lang) => lang.code).join(','),
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== 'en') {
        setTimeout(() => {
          applyGoogleTranslate(saved);
        }, 700);
      }
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit?.();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedLanguage);
    window.dispatchEvent(
      new CustomEvent('storynest-language-change', {
        detail: { language: selectedLanguage },
      })
    );
  }, [selectedLanguage]);

  function handleLanguageChange(languageCode) {
    setSelectedLanguage(languageCode);
    setOpen(false);

    if (languageCode === 'en') {
      const cookieDomain = window.location.hostname;
      document.cookie = `googtrans=/en/en;path=/;domain=${cookieDomain}`;
      document.cookie = `googtrans=/en/en;path=/`;
      window.location.reload();
      return;
    }

    const worked = applyGoogleTranslate(languageCode);

    if (!worked) {
      setTimeout(() => {
        applyGoogleTranslate(languageCode);
      }, 700);
    }
  }

  return (
    <>
      <div id="google_translate_element" className="hidden" />

      <div className="fixed bottom-4 left-4 z-[9999] sm:bottom-6 sm:left-6">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className="mb-3 max-h-[320px] w-[230px] overflow-hidden rounded-2xl border border-white/15 bg-[#2f2f2f] shadow-2xl backdrop-blur"
            >
              <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
                Translate page
              </div>

              <div className="max-h-[260px] overflow-y-auto py-2">
                {LANGUAGES.map((lang) => {
                  const active = lang.code === selectedLanguage;

                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-white/90 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="flex-1">{lang.label}</span>
                      {active && <span className="text-xs text-white/70">✓</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-full border border-white/15 bg-[#2f2f2f] px-4 py-3 text-white shadow-2xl"
        >
          <span className="text-lg">{selectedMeta.flag}</span>
          <span className="hidden text-sm font-medium sm:inline">{selectedMeta.label}</span>
          <span className="text-xs opacity-70">{open ? '▲' : '▼'}</span>
        </motion.button>
      </div>
    </>
  );
}