'use client';

import { useState, useEffect } from 'react';
import { provisionTenant } from '@/features/auth/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

type Lang = 'TH' | 'EN';

const TEXTS = {
    EN: {
        title: 'Setup your Restaurant',
        subtitle: 'Tell us a bit about your shop / kiosk.',
        nameLabel: 'Restaurant Name',
        namePlaceholder: 'e.g. Noodle Master',
        cuisineLabel: 'Cuisine Type',
        cuisinePlaceholder: 'Select Cuisine',
        locationLabel: 'Location',
        locationPlaceholder: 'e.g. Bangkok',
        submit: 'Launch Tanjai POS',
        submitting: 'Creating Shop...',
        errorLogin: 'You must be logged in to create a shop',
    },
    TH: {
        title: 'ตั้งค่าร้านค้าของคุณ',
        subtitle: 'บอกข้อมูลเกี่ยวกับร้านของคุณสั้นๆ',
        nameLabel: 'ชื่อร้านอาหาร',
        namePlaceholder: 'เช่น ก๋วยเตี๋ยวรสเด็ด',
        cuisineLabel: 'ประเภทอาหาร',
        cuisinePlaceholder: 'เลือกประเภทอาหาร',
        locationLabel: 'ที่ตั้ง / สาขา',
        locationPlaceholder: 'เช่น สยามสแควร์',
        submit: 'เริ่มต้นใช้งาน Tanjai POS',
        submitting: 'กำลังสร้างร้าน...',
        errorLogin: 'คุณต้องเข้าสู่ระบบก่อนเพื่อสร้างร้านค้า',
    }
};

export default function OnboardingPage() {
    const [shopName, setShopName] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [lang, setLang] = useState<Lang>('TH'); // Default to TH as per user context

    const router = useRouter();
    const supabase = createClient();
    const t = TEXTS[lang];

    useEffect(() => {
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                toast.error(t.errorLogin);
                router.push('/login');
                return;
            }
            setUser(user);
        };
        getUser();
    }, [router, supabase, t.errorLogin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopName || !user) return;

        setIsSubmitting(true);
        try {
            const result = await provisionTenant(shopName, user.id, user.email || '', { cuisine, location });

            if (result.success) {
                toast.success('Shop created! / สร้างร้านสำเร็จ');
                window.location.href = `/${result.slug}/dashboard`;
            } else {
                toast.error('Error: ' + result.error);
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-900 font-medium">Loading...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200 relative">

                {/* Language Switcher */}
                <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                        onClick={() => setLang('TH')}
                        className={`px-2 py-1 text-xs rounded border ${lang === 'TH' ? 'bg-orange-600 text-white border-orange-600' : 'text-gray-600 border-gray-300'}`}
                    >
                        TH
                    </button>
                    <button
                        onClick={() => setLang('EN')}
                        className={`px-2 py-1 text-xs rounded border ${lang === 'EN' ? 'bg-orange-600 text-white border-orange-600' : 'text-gray-600 border-gray-300'}`}
                    >
                        EN
                    </button>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-gray-900">{t.title}</h1>
                <p className="text-gray-600 mb-8">{t.subtitle}</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">{t.nameLabel}</label>
                        <input
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            placeholder={t.namePlaceholder}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">{t.cuisineLabel}</label>
                        <select
                            value={cuisine}
                            onChange={(e) => setCuisine(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                            required
                        >
                            <option value="" disabled>{t.cuisinePlaceholder}</option>
                            <option value="Thai">Thai / ไทย</option>
                            <option value="Japanese">Japanese / ญี่ปุ่น</option>
                            <option value="Cafe">Cafe / คาเฟ่</option>
                            <option value="Western">Western / ตะวันตก</option>
                            <option value="Noodles">Noodles / ก๋วยเตี๋ยว</option>
                            <option value="Street Food">Street Food / สตรีทฟู้ด</option>
                            <option value="Other">Other / อื่นๆ</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">{t.locationLabel}</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder={t.locationPlaceholder}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-70 shadow-md transform active:scale-95 transition-all mt-4"
                    >
                        {isSubmitting ? t.submitting : t.submit}
                    </button>
                </form>
            </div>
        </div>
    );
}
