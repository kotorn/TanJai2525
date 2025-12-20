'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tanjai/ui';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

/**
 * Staff POS Page - External Order Helper
 * Allows staff to manually log orders from external delivery platforms (UberEats, Demae-can, Wolt)
 */
export default function ExternalOrderPage() {
    const [platform, setPlatform] = useState('ubereats');
    const [amount, setAmount] = useState('');
    const [referenceId, setReferenceId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const supabase = createClient();

        try {
            // In a real app, we'd get the restaurant_id from the context/auth
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch the restaurant owned by the user
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('owner_id', user?.id)
                .single();

            if (!restaurant) throw new Error('Restaurant not found');

            const { error } = await supabase.from('orders').insert({
                restaurant_id: restaurant.id,
                total_amount: parseFloat(amount),
                status: 'completed', // External orders are usually pre-paid
                channel_source: platform as any,
                external_order_id: referenceId,
                items: [], // Simplified for now, in production we'd select items
                customer_notes: `External Order from ${platform}`
            });

            if (error) throw error;

            toast.success('ออเดอร์บันทึกสำเร็จ!');
            setAmount('');
            setReferenceId('');
        } catch (error: any) {
            console.error('[ExternalOrder] Error:', error);
            toast.error('ไม่สามารถบันทึกออเดอร์ได้: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Card className="bg-[#1E1E1E] border-[#333333]">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#FFB300]">
                        บันทึกออเดอร์จากเดลิเวอรี่ (External Order)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="platform">Platform</Label>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger className="bg-[#121212] border-[#333333]">
                                    <SelectValue placeholder="เลือก Platform" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1E1E1E] border-[#333333]">
                                    <SelectItem value="ubereats">UberEats (Uber)</SelectItem>
                                    <SelectItem value="demae-can">Demae-can (出前館)</SelectItem>
                                    <SelectItem value="wolt">Wolt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">ยอดเงินรวม (JPY/THB)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="bg-[#121212] border-[#333333]"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ref">Order Reference ID (จากแอปนั้นๆ)</Label>
                            <Input
                                id="ref"
                                placeholder="เช่น #UE-12345"
                                className="bg-[#121212] border-[#333333]"
                                value={referenceId}
                                onChange={(e) => setReferenceId(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#FFB300] hover:bg-[#FFA000] text-black font-bold h-12"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกออเดอร์'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
