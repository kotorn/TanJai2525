import { z } from 'zod';

// Loyverse API Response Types
export interface LoyverseItem {
  id: string;
  item_name: string;
  reference_id?: string;
  description?: string;
  category_id?: string;
  primary_image_url?: string;
  variants: LoyverseVariant[];
  created_at: string;
  updated_at: string;
}

export interface LoyverseVariant {
  variant_id: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  default_variant: boolean;
  option1_value?: string;
  stores: LoyverseStore[];
}

export interface LoyverseStore {
  store_id: string;
  inventory_tracking: boolean;
  available_quantity?: number;
}

export interface LoyverseReceipt {
  receipt_number: string;
  receipt_type: 'SELL' | 'REFUND';
  receipt_date: string;
  store_id: string;
  customer_id?: string;
  line_items: LoyverseLineItem[];
  total_money: number;
  total_tax: number;
  payments: LoyversePayment[];
}

export interface LoyverseLineItem {
  line_id: string;
  item_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  cost?: number;
  line_note?: string;
  taxes: LoyverseTax[];
}

export interface LoyversePayment {
  payment_type_id: string;
  money: number;
}

export interface LoyverseTax {
  tax_id: string;
  tax_name: string;
  tax_amount: number;
}

// Zod Validation Schemas
export const LoyverseItemSchema = z.object({
  id: z.string(),
  item_name: z.string(),
  reference_id: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  primary_image_url: z.string().url().optional(),
  variants: z.array(z.any()),
  created_at: z.string(),
  updated_at: z.string(),
});

// Loyverse API Client Configuration
export interface LoyverseConfig {
  apiToken: string;
  storeId: string;
  baseUrl?: string;
}

// API Error Response
export interface LoyverseError {
  error_code: string;
  message: string;
  details?: unknown;
}
