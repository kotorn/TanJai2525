import {
  LoyverseConfig,
  LoyverseItem,
  LoyverseReceipt,
  LoyverseError,
} from '@/types/loyverse';

/**
 * Loyverse API Client
 * 
 * Handles all interactions with Loyverse POS API
 * - Product/Inventory sync (import from Loyverse)
 * - Order push (export sales receipts to Loyverse)
 * 
 * @see https://developer.loyverse.com/docs/
 */
export class LoyverseClient {
  private config: LoyverseConfig;
  private baseUrl: string;

  constructor(config: LoyverseConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.loyverse.com/v1.0';
  }

  /**
   * Fetch headers with Authorization
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Handle API errors uniformly
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: LoyverseError = await response.json();
      throw new Error(
        `Loyverse API Error [${error.error_code}]: ${error.message}`
      );
    }
    return response.json();
  }

  /**
   * Fetch all items (products) from Loyverse
   */
  async getItems(): Promise<LoyverseItem[]> {
    const response = await fetch(`${this.baseUrl}/items`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<LoyverseItem[]>(response);
  }

  /**
   * Fetch a single item by ID
   */
  async getItemById(itemId: string): Promise<LoyverseItem> {
    const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<LoyverseItem>(response);
  }

  /**
   * Create a sales receipt (Order Push)
   * 
   * Called when order is packed and shipped to update inventory
   */
  async createReceipt(receipt: LoyverseReceipt): Promise<{ receipt_number: string }> {
    const response = await fetch(`${this.baseUrl}/receipts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(receipt),
    });

    return this.handleResponse<{ receipt_number: string }>(response);
  }

  /**
   * Sync products from Loyverse to Supabase
   * 
   * This should be called periodically (cron job) or manually
   * to keep menu_items table up-to-date
   */
  async syncProducts(): Promise<{ synced: number; errors: string[] }> {
    const { createClient } = await import('./supabase');
    const supabase = createClient();
    
    try {
      console.log('[Loyverse] Starting product sync...');
      
      // 1. Fetch items from Loyverse
      const items = await this.getItems();
      console.log(`[Loyverse] Found ${items.length} items to sync.`);

      // 2. Prepare data for Supabase
      // Note: In real scenarios, we'd also sync categories
      const menuItems = items.map(item => ({
        id: item.id, // Use Loyverse ID as primary key or external ref
        name: item.item_name,
        description: item.description || '',
        price: item.variants?.[0]?.price || 0,
        is_available: !item.is_deleted,
        // For MVP, we use category_id if available, or fallback
        category_id: item.category_id, 
        updated_at: new Date().toISOString(),
      }));

      // 3. Upsert into menu_items table
      const { data, error } = await supabase
        .from('menu_items')
        .upsert(menuItems, { onConflict: 'id' });

      if (error) {
        console.error('[Loyverse] Supabase Upsert Error:', error);
        return { synced: 0, errors: [error.message] };
      }

      console.log(`[Loyverse] Successfully synced ${menuItems.length} items.`);
      return { synced: menuItems.length, errors: [] };

    } catch (error: any) {
      console.error('[Loyverse] Sync failed:', error);
      return { synced: 0, errors: [error.message] };
    }
  }
}

/**
 * Create singleton instance from environment variables
 */
export function createLoyverseClient(): LoyverseClient {
  const apiToken = process.env.LOYVERSE_API_TOKEN;
  const storeId = process.env.LOYVERSE_STORE_ID;

  if (!apiToken || !storeId) {
    throw new Error(
      'Missing Loyverse configuration. Set LOYVERSE_API_TOKEN and LOYVERSE_STORE_ID environment variables.'
    );
  }

  return new LoyverseClient({
    apiToken,
    storeId,
  });
}
