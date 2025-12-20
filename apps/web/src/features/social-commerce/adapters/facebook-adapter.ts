import { ISocialChannelAdapter } from './base-adapter';

export class FacebookAdapter implements ISocialChannelAdapter {
    private readonly accessToken: string;
    private readonly pageId: string;

    constructor() {
        this.accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
        this.pageId = process.env.FACEBOOK_PAGE_ID || '';
    }

    async sendMessage(userId: string, message: string) {
        if (!this.accessToken) {
            console.error('[FacebookAdapter] Access Token missing');
            return { success: false, error: 'Config missing' };
        }

        try {
            const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${this.accessToken}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: { id: userId },
                    message: { text: message }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Facebook API Error');

            return { success: true, messageId: data.message_id };
        } catch (error) {
            console.error('[FacebookAdapter] Send failed:', error);
            return { success: false, error };
        }
    }

    async sendOrderSummary(orderId: string, userId: string) {
        if (!this.accessToken) return { success: false, error: 'Config missing' };

        try {
            const genericTemplate = {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'generic',
                        elements: [
                            {
                                title: `รายการอาหาร #${orderId.slice(0, 8)}`,
                                subtitle: 'ขอบคุณที่สั่งอาหารกับ TanJai POS',
                                buttons: [
                                    {
                                        type: 'web_url',
                                        url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${orderId}`,
                                        title: 'ชำระเงิน'
                                    }
                                ]
                            }
                        ]
                    }
                }
            };

            const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${this.accessToken}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: { id: userId },
                    message: genericTemplate
                })
            });

            const data = await response.json();
            return { success: response.ok, messageId: data.message_id };
        } catch (error) {
            console.error('[FacebookAdapter] Template send failed:', error);
            return { success: false, error };
        }
    }

    async syncInventory(productId: string, qty: number) {
        // Facebook catalog sync logic would go here
        return { success: true };
    }

    async getProfile(userId: string) {
        try {
            const response = await fetch(`https://graph.facebook.com/${userId}?fields=first_name,last_name,profile_pic&access_token=${this.accessToken}`);
            const data = await response.json();
            return {
                name: `${data.first_name} ${data.last_name}`,
                avatarUrl: data.profile_pic,
                success: true
            };
        } catch (error) {
            return { success: false, error };
        }
    }
}
