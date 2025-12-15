import VoiceOrder from '@/features/babel/components/VoiceOrder';
import { ChefHat } from 'lucide-react';

export default function BabelOrderPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ChefHat className="w-10 h-10 text-orange-500" />
          Babel Order
        </h1>
        <p className="text-gray-500 mt-2">
            Experience the future of ordering. Speak in any language, and we'll translate it for the kitchen instantly.
        </p>
      </div>
      
      <div className="flex justify-center">
        <VoiceOrder />
      </div>
    </div>
  );
}
