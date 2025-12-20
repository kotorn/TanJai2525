export interface ISocialChannelAdapter {
    /**
     * Send a plain text message to a specific user on the social channel
     */
    sendMessage(userId: string, message: string): Promise<{ success: boolean; messageId?: string; error?: any }>;

    /**
     * Send a rich order summary (Bill) to the user
     * For LINE: Flex Message
     * For Facebook: Generic Template
     */
    sendOrderSummary(orderId: string, userId: string): Promise<{ success: boolean; messageId?: string; error?: any }>;

    /**
     * Synchronize inventory levels to external marketplaces (e.g. TikTok Shop)
     */
    syncInventory(productId: string, qty: number): Promise<{ success: boolean; error?: any }>;

    /**
     * Get platform-specific profile information
     */
    getProfile?(userId: string): Promise<{ name: string; avatarUrl?: string; error?: any }>;
}
