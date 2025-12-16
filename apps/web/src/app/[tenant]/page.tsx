'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TRANSLATIONS, LANGUAGES } from '@/lib/i18n-config';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Mock Data with Multi-language support and Codes
const MENU_ITEMS = [
  {
    id: '1',
    code: 'A01', // Menu Number
    category: 'main',
    price: 50,
    image: '/images/somtum.jpg', // Ensure you have placeholders
    name: {
      th: 'ส้มตำไทย',
      en: 'Som Tum Thai',
      my: 'သင်္ဘောသီးသုပ်',
      shn: 'သူမ်ႈတမ်',
      lo: 'ຕຳລາວ'
    }
  },
  {
    id: '2',
    code: 'A02',
    category: 'main',
    price: 80,
    image: '/images/kaiyang.jpg',
    name: {
      th: 'ไก่ย่าง',
      en: 'Grilled Chicken',
      my: 'ကြက်ကင်',
      shn: 'ၵႆႇယၢင်ႈ',
      lo: 'ປີ້ງໄກ່'
    }
  },
  {
    id: '3',
    code: 'B01',
    category: 'drink',
    price: 25,
    image: '/images/orangejuice.jpg',
    name: {
      th: 'น้ำส้มคั้น',
      en: 'Orange Juice',
      my: 'လိမ္မော်ရည်',
      shn: 'ၼမ်ႉ',
      lo: 'ນ້ຳດື່ມ'
    }
  },
  {
    id: '4',
    code: 'B02',
    category: 'drink',
    price: 15,
    image: '/images/water.jpg',
    name: {
      th: 'น้ำเปล่า',
      en: 'Water',
      my: 'ရေသန့်',
      shn: 'ၼမ်ႉ',
      lo: 'ນ້ຳດື່ມ'
    }
  }
];

export default function MenuPage() {
  const [lang, setLang] = useState('th');
  const [isMember, setIsMember] = useState(false); // TODO: Replace with real Auth Check
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];
  
  // Get font class based on language
  const currentFont = LANGUAGES.find(l => l.code === lang)?.font || 'font-sans';

  const handleMemberLogin = () => {
     // For now, redirect to global login or show modal
     // In future, this should be a modal for Customer Login (Google/Apple)
     window.location.href = '/login'; 
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-24 ${currentFont}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
          <div className="flex items-center gap-2">
             {!isMember ? (
                <button 
                  onClick={handleMemberLogin}
                  className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                </button>
             ) : (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                  Member
                </span>
             )}
             <div className="text-[10px] font-mono bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
               Guest Mode
             </div>
          </div>
        </div>
        
        {/* Language Switcher */}
        <LanguageSwitcher currentLang={lang} onLanguageChange={setLang} />
      </header>

      {/* Menu Grid */}
      <main className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MENU_ITEMS.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 active:scale-95 transition-transform duration-100"
          >
            {/* Image & Code Badge */}
            <div className="relative h-32 w-full bg-gray-200">
               {/* Use a placeholder if image fails in dry run */}
               <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                 
               </div>
               {/* Menu Code Badge (The requested feature) */}
               <div className="absolute top-2 left-2 bg-black/70 text-white font-mono font-bold text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                 {item.code}
               </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate">
                {item.name[lang as keyof typeof item.name as keyof typeof item.name] || item.name.en}
              </h3>
              
              {/* Secondary Language (Always show English or Thai small underneath if not selected) */}
              {lang !== 'th' && (
                <p className="text-xs text-gray-400 mb-2 truncate">{item.name.th}</p>
              )}

              <div className="flex justify-between items-center mt-2">
                <span className="text-orange-600 font-bold text-lg">
                  {item.price} <span className="text-xs">{t.currency}</span>
                </span>
                <button 
                  className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 shadow-sm"
                  aria-label={t.addToCart}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg safe-area-bottom">
        <button className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl flex justify-between items-center shadow-xl active:scale-95 transition-all">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">2 {t.items}</span>
          </div>
          <span className="text-lg">{t.checkout} • 75 {t.currency}</span>
        </button>
      </div>
    </div>
  );
}
