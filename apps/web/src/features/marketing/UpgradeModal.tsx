'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@tanjai/ui"; // Assuming these exist in UI package or shadcn
import { Button } from "@tanjai/ui";
import { Check, Crown, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UpgradeModal({ isOpen, onClose, featureName = "Pro Feature" }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // TODO: Integrate Stripe/Payment Gateway
    // For now, simulate API call
    setTimeout(() => {
        setLoading(false);
        window.open('https://stripe.com', '_blank'); // Placeholder
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-xl border-t-4 border-t-yellow-400 shadow-2xl">
        <DialogHeader className="space-y-4 text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                <Crown className="w-8 h-8 text-yellow-600" />
            </div>
            
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-500">
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            The <strong>{featureName}</strong> feature is locked. Unlock the full power of Tanjai POS today.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-yellow-50 transition-colors">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Real-time Inventory Sync</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-yellow-50 transition-colors">
                <ShieldCheck className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Advanced Analytics & Exports</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-yellow-50 transition-colors">
                <Check className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Priority Support (24/7)</span>
            </div>
        </div>

        <DialogFooter className="flex-col !space-x-0 space-y-2 mt-4">
            <Button 
                onClick={handleUpgrade} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold h-12 shadow-lg"
            >
                {loading ? 'Processing...' : 'Unlock for ฿299/mo'}
            </Button>
            <Button 
                variant="ghost" 
                onClick={onClose} 
                className="w-full text-gray-400 hover:text-gray-600"
            >
                Maybe Later
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
