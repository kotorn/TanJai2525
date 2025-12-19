'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@tanjai/ui';
import { createClient } from '@/lib/supabase/client';
import { hardwareService } from '@/services/hardware-service';
import { useState } from 'react';
import { toast } from 'sonner';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const shortOrderId = typeof orderId === 'string' ? orderId.slice(-6).toUpperCase() : '';
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (typeof orderId !== 'string') return;
    setIsPrinting(true);
    try {
        const supabase = createClient();
        // Fetch full order details
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    quantity,
                    price,
                    menu_items (
                        name
                    )
                )
            `)
            .eq('id', orderId)
            .single();

        if (error || !order) {
            toast.error('ไม่พบข้อมูลออเดอร์');
            return;
        }

        // Transform to Bridge Payload
        const payload = {
            id: shortOrderId,
            tableId: order.table_no,
            totalAmount: order.total_amount,
            items: order.order_items.map((oi: any) => ({
                name: oi.menu_items?.name || 'Unknown Item',
                quantity: oi.quantity,
                price: oi.price
            }))
        };

        await hardwareService.printReceipt(payload);

    } catch (err) {
        console.error(err);
        toast.error('Failed to print');
    } finally {
        setIsPrinting(false);
    }
  };

  // Deep link to LINE Official Account
  // In production, this should come from tenant settings in the database
  // For now, using environment variable with safe fallback
  const LINE_OA_ID = process.env.NEXT_PUBLIC_LINE_OA_ID;
  const LINE_OA_LINK = LINE_OA_ID 
    ? `https://line.me/R/oaMessage/${LINE_OA_ID}/?${encodeURIComponent(`สวัสดีครับ แจ้งชำระเงินสำหรับออเดอร์ #${shortOrderId}`)}`
    : null;

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
            
            {LINE_OA_LINK ? (
              <a href={LINE_OA_LINK} className="block w-full">
                <Button className="w-full bg-[#06C755] hover:bg-[#05B34C] text-white py-6 rounded-2xl flex items-center justify-center gap-2 shadow-glow">
                    <MessageCircle size={24} />
                    <span>ส่งสลิปผ่าน LINE OA</span>
                </Button>
              </a>
            ) : (
              <div className="w-full bg-gray-100 text-gray-700 py-6 px-4 rounded-2xl text-center">
                <p className="font-medium">ขอบคุณสำหรับคำสั่งซื้อ</p>
                <p className="text-sm text-gray-500 mt-1">กรุณาแจ้งพนักงานเพื่อชำระเงิน</p>
              </div>
            )}

            <Button 
                variant="secondary" 
                className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl flex items-center justify-center gap-2"
                onClick={handlePrint}
                disabled={isPrinting}
            >
                <Printer size={24} />
                <span>{isPrinting ? 'กำลังพิมพ์...' : 'พิมพ์ใบเสร็จ'}</span>
            </Button>

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
