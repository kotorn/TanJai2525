import { SupabaseClient } from '@supabase/supabase-js';

export type PromotionRule = {
    attribute: 'cart_total' | 'category_id' | 'product_id';
    operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
    values: any[];
};

export type Promotion = {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    is_active: boolean;
    usage_limit?: number;
    usage_count: number;
    rules: PromotionRule[];
};

export class PromotionService {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Retrieves a promotion and its rules by code.
     */
    async getPromotionByCode(code: string): Promise<Promotion | null> {
        const { data, error } = await this.supabase
            .from('promotions')
            .select(`
                *,
                rules:promotion_rules(*)
            `)
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !data) return null;
        return data as Promotion;
    }

    /**
     * Validates if a cart context satisfies a promotion's rules.
     */
    validatePromotion(promotion: Promotion, context: { cartTotal: number; items: any[] }): boolean {
        // 1. Check basic limits
        if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
            return false;
        }

        // 2. Check each rule (AND logic)
        for (const rule of promotion.rules) {
            if (!this.evaluateRule(rule, context)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculates the discount amount based on promotion type.
     */
    calculateDiscount(promotion: Promotion, cartTotal: number): number {
        if (promotion.type === 'percentage') {
            return (cartTotal * promotion.value) / 100;
        } else {
            return Math.min(promotion.value, cartTotal);
        }
    }

    private evaluateRule(rule: PromotionRule, context: { cartTotal: number; items: any[] }): boolean {
        switch (rule.attribute) {
            case 'cart_total':
                return this.compare(context.cartTotal, rule.operator, rule.values[0]);
            
            case 'product_id':
                const productIds = context.items.map(i => i.menu_item_id);
                return productIds.some(id => rule.values.includes(id));
            
            default:
                return true;
        }
    }

    private compare(val: any, op: string, limit: any): boolean {
        switch (op) {
            case 'gte': return val >= limit;
            case 'gt': return val > limit;
            case 'lte': return val <= limit;
            case 'lt': return val < limit;
            case 'eq': return val === limit;
            case 'in': return Array.isArray(limit) && limit.includes(val);
            default: return false;
        }
    }
}
