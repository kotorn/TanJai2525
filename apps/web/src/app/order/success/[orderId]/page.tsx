'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@tanjai/ui';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const shortOrderId = typeof orderId === 'string' ? orderId.slice(-6).toUpperCase() : '';

  // Deep link to LINE Official Account (Example: @tanjai)
  // In a real app, this should come from tenant settings
  const LINE_OA_LINK = 'https://line.me/R/oaMessage/@tanjai/?' + encodeURIComponent(`สวัสดีครับ แจ้งชำระเงินสำหรับออเดอร์ #${shortOrderId}`);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 font-body">
      <div className="glass-panel w-full max-max-w-md p-8 rounded-3xl flex flex-col items-center text-center space-y-6">
        <div className="bg-green-500/20 p-4 rounded-full">
            <CheckCircle2 size={64} className="text-green-500" />
        </div>
        
        <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display">สั่งอาหารเรียบร้อยแล้ว!</h1>
            <p className="text-TEXT_SECONDARY">ออเดอร์ลำดับที่ของคุณคือ</p>
            <div className="text-4xl font-black text-BURNT_ORANGE tracking-widest py-2">
                #{shortOrderId}
            </div>
        </div>

        <div className="w-full pt-4 space-y-4">
            <p className="text-sm text-TEXT_SECONDARY">รบกวนส่งหลักฐานการโอนเงินผ่าน LINE OA เพื่อให้ร้านค้าเริ่มดำเนินการครับ</p>
            
            <a href={LINE_OA_LINK} className="block w-full">
                <Button className="w-full bg-[#06C755] hover:bg-[#05B34C] text-white py-6 rounded-2xl flex items-center justify-center gap-2 shadow-glow">
                    <MessageCircle size={24} />
                    <span>ส่งสลิปผ่าน LINE OA</span>
                </Button>
            </a>

            <Link href="/" className="block w-full">
                <Button variant="ghost" className="w-full text-TEXT_SECONDARY flex items-center gap-2">
                    <ArrowLeft size={18} />
                    <span>กลับสู่หน้าหลัก</span>
                </Button>
            </Link>
        </div>
      </div>
      
      <div className="mt-8 text-xs text-TEXT_MUTED text-center">
        Tanjai POS - Smart Street Food Solution
      </div>
    </div>
  );
}
