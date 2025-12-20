import { ISocialChannelAdapter } from './base-adapter';

export class LineAdapter implements ISocialChannelAdapter {
    private readonly accessToken: string;

    constructor() {
        this.accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    }

    async sendMessage(userId: string, message: string) {
        if (!this.accessToken) {
            console.error('[LineAdapter] Access Token missing');
            return { success: false, error: 'Config missing' };
        }

        try {
            const response = await fetch('https://api.line.me/v2/bot/message/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    to: userId,
                    messages: [{ type: 'text', text: message }]
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'LINE API Error');

            return { success: true, messageId: data.requestId };
        } catch (error) {
            console.error('[LineAdapter] Send failed:', error);
            return { success: false, error };
        }
    }

    async sendOrderSummary(orderId: string, userId: string) {
        if (!this.accessToken) return { success: false, error: 'Config missing' };

        try {
            // Simplified Flex Message for Bill
            const flexMessage = {
                type: 'flex' as const,
                altText: `บิลสำหรับเลขออเดอร์ #${orderId.slice(0, 8)}`,
                contents: {
                    type: 'bubble',
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            { type: 'text', text: 'TanJai POS', weight: 'bold', color: '#1DB446', size: 'sm' },
                            { type: 'text', text: 'สรุปรายการอาหาร', weight: 'bold', size: 'xl', margin: 'md' },
                            { type: 'text', text: `Order ID: #${orderId.slice(0, 8)}`, size: 'xs', color: '#aaaaaa', wrap: true },
                            { type: 'separator', margin: 'xxl' },
                            {
                                type: 'box',
                                layout: 'vertical',
                                margin: 'xxl',
                                spacing: 'sm',
                                contents: [
                                    { type: 'text', text: 'ขอบคุณที่ใช้บริการครับ!', size: 'sm', color: '#555555', flex: 0 }
                                ]
                            }
                        ]
                    },
                    footer: {
                        type: 'box',
                        layout: 'vertical',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'button',
                                style: 'primary',
                                height: 'sm',
                                color: '#1DB446',
                                action: {
                                    type: 'uri',
                                    label: 'ดูรายละเอียด / ชำระเงิน',
                                    uri: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${orderId}`
                                }
                            }
                        ]
                    }
                }
            };

            const response = await fetch('https://api.line.me/v2/bot/message/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    to: userId,
                    messages: [flexMessage]
                })
            });

            const data = await response.json();
            return { success: response.ok, messageId: data.requestId };
        } catch (error) {
            console.error('[LineAdapter] Flex send failed:', error);
            return { success: false, error };
        }
    }

    async sendProductCarousel(products: any[], userId: string) {
        if (!this.accessToken) return { success: false, error: 'Config missing' };

        try {
            const bubbles = products.map(product => ({
                type: 'bubble',
                hero: {
                    type: 'image',
                    url: product.image_url || 'https://tanjai.app/placeholder-food.png',
                    size: 'full',
                    aspectRatio: '20:13',
                    aspectMode: 'cover'
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        { type: 'text', text: product.name, weight: 'bold', size: 'xl' },
                        { type: 'text', text: `${product.price} THB`, size: 'sm', color: '#1DB446' }
                    ]
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'button',
                            style: 'primary',
                            color: '#1DB446',
                            action: {
                                type: 'uri',
                                label: 'สั่งเลย',
                                uri: `${process.env.NEXT_PUBLIC_APP_URL}/menu/${product.id}`
                            }
                        }
                    ]
                }
            }));

            const response = await fetch('https://api.line.me/v2/bot/message/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    to: userId,
                    messages: [{
                        type: 'flex',
                        altText: 'รายการสินค้าที่คุณค้นหา',
                        contents: {
                            type: 'carousel',
                            contents: bubbles.slice(0, 10) // LINE limit
                        }
                    }]
                })
            });

            const data = await response.json();
            return { success: response.ok, messageId: data.requestId };
        } catch (error) {
            console.error('[LineAdapter] Carousel failed:', error);
            return { success: false, error };
        }
    }

    async syncInventory(productId: string, qty: number) {
        // LINE OA doesn't have native inventory sync like TikTok
        return { success: true };
    }

    async getProfile(userId: string): Promise<{ name: string; avatarUrl?: string; error?: any }> {
        if (!this.accessToken) return { name: '', error: 'Config missing' };

        try {
            const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            const data = await response.json();
            return {
                name: data.displayName,
                avatarUrl: data.pictureUrl,
                error: response.ok ? undefined : data.message
            };
        } catch (error) {
            return { name: '', error };
        }
    }
}
