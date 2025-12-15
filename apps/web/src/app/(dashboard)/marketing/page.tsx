import DailyDish from '@/features/marketing/DailyDish';
import { Megaphone } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Megaphone className="w-10 h-10 text-pink-500" />
          Viral Machine
        </h1>
        <p className="text-gray-500 mt-2">
            Turn your kitchen data into social media gold.
        </p>
      </div>
      
      <DailyDish />
    </div>
  );
}
