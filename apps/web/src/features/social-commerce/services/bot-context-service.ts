import { createClient } from '@/lib/supabase/server';

export interface BotContext {
    restaurantName: string;
    menuItems: Array<{ name: string; price: number; description?: string }>;
    location?: string;
    openingHours?: string;
}

export class BotContextService {
    /**
     * Gathers all relevant information about a restaurant to provide context for the AI
     */
    static async getContext(restaurantId: string): Promise<BotContext> {
        const supabase = createClient();

        // 1. Fetch Restaurant Info
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('name')
            .eq('id', restaurantId)
            .single();

        // 2. Fetch Menu Items
        const { data: items } = await supabase
            .from('menu_items')
            .select('name, price, description')
            .eq('restaurant_id', restaurantId)
            .eq('is_available', true);

        return {
            restaurantName: restaurant?.name || 'ร้านอาหาร TanJai',
            menuItems: items || [],
            location: 'ญี่ปุ่น (Japan)', // Placeholder - could be fetched from restaurant settings if added
            openingHours: '10:00 - 22:00' // Placeholder
        };
    }

    /**
     * Formats the context into a system prompt for the AI
     */
    static formatSystemPrompt(context: BotContext): string {
        const itemsList = context.menuItems
            .map(item => `- ${item.name}: ${item.price} THB (${item.description || 'ไม่มีรายละเอียด'})`)
            .join('\n');

        return `คุณคือ "TanJai AI Assistant" ผู้ช่วยอัจฉริยะของร้าน ${context.restaurantName}
สถานที่ตั้ง: ${context.location}
เวลาทำการ: ${context.openingHours}

นี่คือรายการเมนูของร้่าน:
${itemsList}

คำแนะนำการตอบคำถาม:
1. ตอบสุภาพ มีความเป็นกันเองแบบ Co-founder (ใช้ "ครับ/ค่ะ" ตามความเหมาะสม)
2. หากลูกค้าถามถึงเมนู ให้แนะนำเมนูที่เหมาะสม
3. หากลูกค้าถามถึงราคา ให้แจ้งราคาตามรายการข้างต้น
4. หากลูกค้าถามสิ่งที่ไม่มีในข้อมูล ให้ตอบว่า "ขออภัยครับ ผมขอตรวจสอบข้อมูลเพิ่มเติมให้คุณสักครู่นะครับ" หรือแนะนำให้ติดต่อพนักงานโดยตรง
5. ตอบเป็นภาษาไทยเป็นหลัก แต่ถ้าลูกค้าถามภาษาอังกฤษหรือญี่ปุ่น ให้ตอบในภาษานั้นๆ ได้
6. กระตุ้นให้ลูกค้าสั่งอาหารผ่านระบบ TanJai-POS โดยส่งลิงก์เมนูให้หากจำเป็น`;
    }
}
