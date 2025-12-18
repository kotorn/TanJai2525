'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tanjai/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tanjai/ui';
import { Printer, Clock, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface QRGeneratorProps {
  tenantId: string;
  baseUrl: string;
}

export function QRGenerator({ tenantId, baseUrl }: QRGeneratorProps) {
  const [activeTab, setActiveTab] = useState('static');
  const [tableNo, setTableNo] = useState('1');
  const [amount, setAmount] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState('15');
  const [timeLeft, setTimeLeft] = useState(0);

  // URLs
  const staticUrl = `${baseUrl}/r/${tenantId}/t/${tableNo}`;
  const [dynamicUrl, setDynamicUrl] = useState('');

  const generateDynamicQR = () => {
    if (!amount) {
        toast.error('กรุณาระบุจำนวนเงิน');
        return;
    }
    // Mocking Transaction ID generation
    const txId = Math.random().toString(36).substring(7).toUpperCase();
    setDynamicUrl(`${baseUrl}/pay/${txId}?amount=${amount}`);
    setTimeLeft(parseInt(expiryMinutes) * 60);
    toast.success(`สร้าง QR สำหรับยอด ฿${amount} เรียบร้อยแล้ว`);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePrint = () => {
    window.print();
    toast.info('กำลังส่งไปที่เครื่องพิมพ์...');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-panel border-white/5 text-white">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Smart QR Generator</CardTitle>
        <CardDescription className="text-TEXT_SECONDARY text-xs italic">สร้าง QR Code สำหรับโต๊ะ หรือ ยอดชำระเงินรายครั้ง</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="static" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10 rounded-2xl p-1 mb-8">
            <TabsTrigger value="static" className="rounded-xl data-[state=active]:bg-BURNT_ORANGE data-[state=active]:text-white transition-all text-xs font-bold py-2.5 uppercase tracking-wider">Static (Table)</TabsTrigger>
            <TabsTrigger value="dynamic" className="rounded-xl data-[state=active]:bg-BURNT_ORANGE data-[state=active]:text-white transition-all text-xs font-bold py-2.5 uppercase tracking-wider">Dynamic (Order)</TabsTrigger>
          </TabsList>

          <TabsContent value="static" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="bg-white p-4 rounded-3xl shadow-glow">
                <QRCodeSVG value={staticUrl} size={200} />
              </div>
              <div className="space-y-6 flex-1 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-TEXT_SECONDARY tracking-widest">เลือกเลขโต๊ะ</label>
                  <Select value={tableNo} onValueChange={setTableNo}>
                    <SelectTrigger className="glass-panel border-white/10 text-white rounded-2xl h-12">
                      <SelectValue placeholder="เลือกโต๊ะ" />
                    </SelectTrigger>
                    <SelectContent className="bg-MIDNIGHT_SURFACE border-white/10 text-white rounded-2xl">
                      {[1, 2, 3, 4, 5, 10, 20].map((n) => (
                        <SelectItem key={n} value={n.toString()} className="hover:bg-BURNT_ORANGE focus:bg-BURNT_ORANGE">Table {n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-TEXT_SECONDARY">
                   <p className="font-mono bg-black/20 p-2 rounded-xl border border-white/5 mt-2 truncate">{staticUrl}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dynamic" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
               <div className="bg-white p-4 rounded-3xl shadow-glow relative overflow-hidden group">
                  {dynamicUrl ? (
                    <QRCodeSVG value={dynamicUrl} size={200} />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center text-gray-300 italic text-xs">ระบุยอดเงินก่อน</div>
                  )}
                  {timeLeft > 0 && (
                    <div className="absolute top-2 right-2 bg-BURNT_ORANGE text-white text-[10px] px-2 py-1 rounded-full animate-pulse font-black uppercase tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>
                  )}
               </div>
               <div className="space-y-6 flex-1 w-full">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-TEXT_SECONDARY tracking-widest">ระบุยอดเงิน (THB)</label>
                    <Input 
                        placeholder="0.00" 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-panel border-white/10 text-white rounded-2xl h-12 text-xl font-bold font-mono placeholder:text-TEXT_MUTED"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-TEXT_SECONDARY tracking-widest">เวลาหมดอายุ (นาที)</label>
                    <Select value={expiryMinutes} onValueChange={setExpiryMinutes}>
                      <SelectTrigger className="glass-panel border-white/10 text-white rounded-2xl h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-MIDNIGHT_SURFACE border-white/10 text-white rounded-2xl">
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={generateDynamicQR} className="w-full bg-BURNT_ORANGE hover:bg-BURNT_ORANGE/90 text-white rounded-2xl h-12 font-black shadow-glow uppercase">
                    <Plus className="mr-2" size={18} />
                    Generate One-Time QR
                  </Button>
               </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-white/5">
            <Button variant="outline" onClick={handlePrint} className="border-white/10 text-TEXT_SECONDARY hover:bg-white/5 rounded-2xl h-12 font-bold transition-all">
                <Printer className="mr-2" size={18} />
                Print Label
            </Button>
            <Button variant="outline" className="border-white/10 text-TEXT_SECONDARY hover:bg-white/5 rounded-2xl h-12 font-bold transition-all">
                <Download className="mr-2" size={18} />
                Save Image
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
