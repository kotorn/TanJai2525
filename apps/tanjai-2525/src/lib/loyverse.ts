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
    // TODO: Implement sync logic
    // 1. Fetch items from Loyverse
    // 2. Transform to Supabase schema
    // 3. Upsert into menu_items table
    // 4. Return sync results
    
    console.warn('syncProducts not yet implemented');
    return { synced: 0, errors: [] };
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
