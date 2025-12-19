import { SupabaseClient } from '@supabase/supabase-js';
import { SlipVerificationService } from './slip-verification-service';

export class PaymentService {
    private slipService: SlipVerificationService;

    constructor(private readonly supabase: SupabaseClient) {
        this.slipService = new SlipVerificationService();
    }

    /**
     * Processes a payment for an order.
     */
    async processPayment(orderId: string, paymentMethod: string, amount: number) {
        console.log(`[PaymentService] Processing ${paymentMethod} payment for Order ${orderId}`);

        // 1. Update Order Status
        const { error } = await this.supabase
            .from('orders')
            .update({
                status: 'paid',
                payment_method: paymentMethod,
                paid_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            console.error('[PaymentService] Process Payment Error:', error);
            throw new Error(`Failed to process payment: ${error.message}`);
        }

        return { success: true };
    }

    /**
     * Verifies a payment slip using the integrated verification service.
     */
    async verifySlip(slipImage: string) {
        return this.slipService.verifySlip(slipImage);
    }

    /**
     * Generates a PromptPay QR code payload (Placeholder).
     */
    generatePromptPayQR(amount: number) {
        // In a real app, use a library like 'promptpay-qr'
        return `promptpay://payload?amount=${amount}`; // Pseudo-code
    }
}
