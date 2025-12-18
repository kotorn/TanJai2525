/**
 * LINE Messaging API Utility
 * Handles sending push messages and flex messages for order updates.
 */

const LINE_API_URL = 'https://api.line.me/v2/bot/message/push';
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function sendOrderNotification(to: string, orderId: string, total: number, items: any[]) {
    if (!CHANNEL_ACCESS_TOKEN) {
        console.warn('[LINE] Channel Access Token missing. Skipping notification.');
        return { success: false, reason: 'missing_token' };
    }

    try {
        const response = await fetch(LINE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                to: to,
                messages: [
                    {
                        type: 'text',
                        text: `🍔 ออเดอร์ใหม่! #${orderId.slice(-6)}\nยอดรวม: ฿${total}\nรายการ: ${items.map(i => i.name).join(', ')}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[LINE] API Error:', errorData);
            return { success: false, error: errorData };
        }

        return { success: true };
    } catch (error) {
        console.error('[LINE] Network Error:', error);
        return { success: false, error };
    }
}

/**
 * Send a Flex Message (Reserved for Phase 5)
 */
export async function sendFlexOrder(to: string, orderData: any) {
    // Implementation for richer UI receipts
}
