'use client';

import { LANGUAGES } from '@/lib/i18n-config';

interface Props {
  currentLang: string;
  onLanguageChange: (code: string) => void;
}

export default function LanguageSwitcher({ currentLang, onLanguageChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm whitespace-nowrap transition-all
            ${
              currentLang === lang.code
                ? 'bg-orange-500 text-white border-orange-600 shadow-md transform scale-105'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          <span className="text-lg">{lang.flag}</span>
          <span className={lang.code === currentLang ? 'font-bold' : ''}>
            {lang.label}
          </span>
        </button>
      ))}
    </div>
  );
}
