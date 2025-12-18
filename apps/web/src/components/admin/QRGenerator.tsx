"use client";

import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Printer, RefreshCw, QrCode, Banknote } from "lucide-react";

interface QRGeneratorProps {
  tenantId: string;
  baseUrl: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ tenantId, baseUrl }) => {
  const [activeTab, setActiveTab] = useState("static");
  const [selectedTable, setSelectedTable] = useState("1");
  const [amount, setAmount] = useState("");
  const [dynamicQRUrl, setDynamicQRUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const staticQRUrl = `${baseUrl}/table/${selectedTable}?tenant=${tenantId}`;

  const generateDynamicQR = async () => {
    setLoading(true);
    // Simulation of API call
    setTimeout(() => {
        const transactionId = Math.random().toString(36).substring(7);
        setDynamicQRUrl(`${baseUrl}/pay/${transactionId}?amount=${amount}`);
        setLoading(false);
    }, 500);
  };

  const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
          const canvas = document.getElementById('static-qr-canvas') as HTMLCanvasElement;
          const dataUrl = canvas ? canvas.toDataURL() : '';
          
          printWindow.document.write(`
            <html>
                <head>
                    <title>Print Table ${selectedTable}</title>
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        .label { border: 2px solid black; padding: 20px; text-align: center; border-radius: 10px; }
                        h1 { margin: 0 0 10px 0; font-size: 24px; }
                        p { font-size: 12px; color: #555; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="label">
                        <h1>Table ${selectedTable}</h1>
                        <img src="${dataUrl}" width="200" height="200" />
                        <p>Scan to Order</p>
                    </div>
                    <script>window.print(); setTimeout(() => window.close(), 500);</script>
                </body>
            </html>
          `);
          printWindow.document.close();
      }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="grid w-full grid-cols-2 mb-8 bg-surface-dark border border-white/10 rounded-xl p-1">
          <button 
            onClick={() => setActiveTab("static")}
            className={`flex items-center justify-center py-3 rounded-lg transition-all font-medium ${activeTab === 'static' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <QrCode className="w-5 h-5 mr-2" /> Static (Tables)
          </button>
          <button 
            onClick={() => setActiveTab("dynamic")}
            className={`flex items-center justify-center py-3 rounded-lg transition-all font-medium ${activeTab === 'dynamic' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
             <Banknote className="w-5 h-5 mr-2" /> Dynamic (Pay)
          </button>
      </div>
        
      {/* Content */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 text-white shadow-glass min-h-[400px]">
        
        {activeTab === 'static' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-xl font-bold mb-1">Table QR Code</h2>
              <p className="text-gray-400 text-sm">Generate permanent QR codes for tables.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Table Number</label>
              <select 
                value={selectedTable} 
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full h-12 bg-surface-dark border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num.toString()}>
                    Table {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center justify-center p-8 border border-white/10 rounded-2xl bg-white text-black">
              <QRCodeCanvas id="static-qr-canvas" value={staticQRUrl} size={240} level="H" includeMargin />
              <p className="mt-4 text-xs text-gray-500 font-mono break-all text-center">{staticQRUrl}</p>
            </div>

            <button 
                onClick={handlePrint}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center transition-colors"
            >
              <Printer className="mr-2 h-5 w-5" /> Print Label
            </button>
          </div>
        )}

        {activeTab === 'dynamic' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div>
              <h2 className="text-xl font-bold mb-1">Payment QR Code</h2>
              <p className="text-gray-400 text-sm">Generate one-time QR codes for payments.</p>
            </div>

             <div className="space-y-2">
                 <label className="text-sm font-medium">Amount (THB)</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">฿</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      className="w-full h-12 pl-8 bg-surface-dark border border-white/10 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                 </div>
             </div>
               
             <button 
                onClick={generateDynamicQR} 
                className="w-full h-12 bg-secondary hover:bg-secondary/90 text-black font-bold rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!amount || loading}
             >
                 {loading ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : "Generate QR"}
             </button>

             {dynamicQRUrl && (
                 <div className="flex flex-col items-center justify-center p-6 border border-white/10 rounded-2xl bg-white mt-6 animate-in zoom-in duration-300 relative overflow-hidden">
                    <QRCodeCanvas value={dynamicQRUrl} size={240} level="H" includeMargin />
                    <div className="mt-4 bg-red-100 text-red-600 px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Expires in 14:59
                    </div>
                 </div>
             )}
           </div>
        )}

      </div>
    </div>
  );
};
