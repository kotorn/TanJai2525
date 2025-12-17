"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { motion } from "framer-motion";

export function QRGenerator() {
  const [activeTab, setActiveTab] = useState("static");
  const [tableId, setTableId] = useState("1");
  const [amount, setAmount] = useState("");
  const [generatedDynamicURL, setGeneratedDynamicURL] = useState("");
  const [expiry, setExpiry] = useState<Date | null>(null);

  const staticURL = `https://app.tanjai.com/table/${tableId}`;

  const handleGenerateDynamic = () => {
    // Mock generation - in real app this would call API
    const transactionId = Math.random().toString(36).substring(7);
    setGeneratedDynamicURL(`https://app.tanjai.com/pay/${transactionId}`);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    setExpiry(now);
  };

  return (
    <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 shadow-xl max-w-md w-full mx-auto">
      <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-500">
          qr_code_2
        </span>
        QR Generator
      </h2>

      <Tabs
        defaultValue="static"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-black/40 p-1 rounded-xl mb-6">
          <TabsTrigger
            value="static"
            className="rounded-lg py-2 text-sm font-medium transition-all data-[state=active]:bg-primary-500 data-[state=active]:text-white text-gray-400"
          >
            Static (Table)
          </TabsTrigger>
          <TabsTrigger
            value="dynamic"
            className="rounded-lg py-2 text-sm font-medium transition-all data-[state=active]:bg-secondary-500 data-[state=active]:text-black text-gray-400"
          >
            Dynamic (Order)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="static" className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Select Table Number</label>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Table {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl">
            <QRCodeSVG value={staticURL} size={200} level="H" />
            <p className="text-black font-mono text-sm">{staticURL}</p>
          </div>

          <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">print</span>
            Print Table Label
          </button>
        </TabsContent>

        <TabsContent value="dynamic" className="space-y-6">
          {!generatedDynamicURL ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Order Amount (THB)</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">฿</span>
                    <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-secondary-500 transition-colors placeholder:text-gray-600"
                    />
                </div>
              </div>
              <button
                onClick={handleGenerateDynamic}
                disabled={!amount}
                className="w-full bg-gradient-to-r from-secondary-500 to-yellow-600 hover:opacity-90 text-black font-bold py-3 rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Payment QR
              </button>
            </div>
          ) : (
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
             >
                <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl border-4 border-secondary-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 bg-secondary-500 text-black text-center text-xs font-bold py-1">
                        ONE-TIME USE
                    </div>
                    <div className="mt-4">
                        <QRCodeSVG value={generatedDynamicURL} size={200} level="Q" />
                    </div>
                    <div className="text-center">
                        <p className="text-black font-bold text-xl">฿{amount}</p>
                        {expiry && (
                            <p className="text-red-500 text-sm font-medium animate-pulse">
                                Expires at {expiry.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        )}
                    </div>
                </div>
                <button 
                    onClick={() => {
                        setGeneratedDynamicURL("");
                        setAmount("");
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors"
                >
                    Create New Transaction
                </button>
             </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
