import { SupabaseClient } from '@supabase/supabase-js';

export type Customer = {
    id: string;
    email: string | null;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
    user_id: string | null;
    metadata: any;
};

export class CustomerService {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Find or create a customer during checkout.
     * Logic:
     * 1. If userId is provided, find customer by userId.
     * 2. If no userId, try finding by email (Guest returning with same email).
     * 3. If neither, create a new Guest customer.
     */
    async handleCheckoutCustomer(email: string | undefined, userId?: string, phone?: string): Promise<string | null> {
        if (!email && !userId) return null; // Anonymous without contact info? Maybe just return null.

        let customerId: string | null = null;

        // 1. Try finding by User ID (Strongest link)
        if (userId) {
            const { data: existingUserCustomer } = await this.supabase
                .from('customers')
                .select('id')
                .eq('user_id', userId)
                .single();
            
            if (existingUserCustomer) {
                return existingUserCustomer.id;
            }
        }

        // 2. Try finding by Email (Guest retention)
        if (email) {
            const { data: existingEmailCustomer } = await this.supabase
                .from('customers')
                .select('id, user_id')
                .eq('email', email)
                .single();

            if (existingEmailCustomer) {
                // If we have a userId now but the record doesn't, we "Claim" it!
                if (userId && !existingEmailCustomer.user_id) {
                    await this.supabase
                        .from('customers')
                        .update({ user_id: userId })
                        .eq('id', existingEmailCustomer.id);
                }
                return existingEmailCustomer.id;
            }
        }

        // 3. Create New Customer
        const { data: newCustomer, error } = await this.supabase
            .from('customers')
            .insert({
                email: email || null,
                phone: phone || null,
                user_id: userId || null,
                // We could split name from metadata if provided, simplified for now
            })
            .select('id')
            .single();

        if (error) {
            console.error('[CustomerService] Failed to create customer:', error);
            // Fallback: don't block order creation
            return null;
        }

        return newCustomer.id;
    }

    async getCustomerById(id: string): Promise<Customer | null> {
        const { data, error } = await this.supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) return null;
        return data as Customer;
    }
}
