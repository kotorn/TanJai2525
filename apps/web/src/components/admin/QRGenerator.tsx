"use client";

import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
      // Basic print logic via new window
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
      <Tabs defaultValue="static" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-surface-dark border border-white/10 rounded-xl p-1">
          <TabsTrigger value="static" className="text-lg data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all h-full">
            <QrCode className="w-5 h-5 mr-2" /> Static (Tables)
          </TabsTrigger>
          <TabsTrigger value="dynamic" className="text-lg data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all h-full">
             <Banknote className="w-5 h-5 mr-2" /> Dynamic (Pay)
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="static" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-panel border-0 text-white">
            <CardHeader>
              <CardTitle>Table QR Code</CardTitle>
              <CardDescription className="text-gray-400">Generate permanent QR codes for tables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Table Number</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="bg-surface-dark border-white/10 text-white h-12">
                    <SelectValue placeholder="Select Table" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-dark border-white/10 text-white">
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Table {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center justify-center p-8 border border-white/10 rounded-2xl bg-white text-black">
                <QRCodeCanvas id="static-qr-canvas" value={staticQRUrl} size={240} level="H" includeMargin />
                <p className="mt-4 text-xs text-gray-500 font-mono">{staticQRUrl}</p>
              </div>

              <Button className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white" onClick={handlePrint}>
                <Printer className="mr-2 h-5 w-5" /> Print Label
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dynamic" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-panel border-0 text-white">
             <CardHeader>
              <CardTitle>Payment QR Code</CardTitle>
              <CardDescription className="text-gray-400">Generate one-time QR codes for payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                 <Label>Amount (THB)</Label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">฿</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      className="pl-8 bg-surface-dark border-white/10 text-white h-12 text-lg"
                    />
                 </div>
               </div>
               
               <Button onClick={generateDynamicQR} className="w-full h-12 text-lg bg-secondary hover:bg-secondary/90 text-black font-bold" disabled={!amount || loading}>
                 {loading ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : "Generate QR"}
               </Button>

               {dynamicQRUrl && (
                 <div className="flex flex-col items-center justify-center p-6 border border-white/10 rounded-2xl bg-white mt-6 animate-in zoom-in duration-300 relative overflow-hidden">
                    <QRCodeCanvas value={dynamicQRUrl} size={240} level="H" includeMargin />
                    <div className="mt-4 bg-red-100 text-red-600 px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Expires in 14:59
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
