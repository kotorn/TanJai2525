export const LOYVERSE_API_BASE_URL = 'https://api.loyverse.com/v1.0';

export interface LoyverseLineItem {
  [key: string]: unknown;
  id?: string;
  item_id?: string;
  item_name?: string;
  variant_id?: string;
  variant_name?: string;
  quantity?: number;
  price?: number;
  cost?: number;
  total_money?: number;
  gross_total_money?: number;
}

export interface LoyversePayment {
  [key: string]: unknown;
  payment_type_id?: string;
  payment_type?: string;
  money?: number;
  amount?: number;
}

export interface LoyverseReceipt {
  [key: string]: unknown;
  id?: string;
  receipt_number?: string;
  receipt_type?: string;
  receipt_date?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  customer_id?: string;
  employee_id?: string;
  source?: string;
  order?: string;
  total_money?: number;
  total_tax?: number;
  total_discount?: number;
  total_discounts?: number;
  total_gross_sales?: number;
  total_cost?: number;
  line_items?: LoyverseLineItem[];
  payments?: LoyversePayment[];
}

export interface LoyverseReceiptPage {
  receipts: LoyverseReceipt[];
  cursor?: string;
}

export interface LoyverseClientConfig {
  apiToken: string;
  storeId: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface ListReceiptsOptions {
  storeId: string;
  createdAtMin?: string;
  createdAtMax?: string;
  updatedAtMin?: string;
  updatedAtMax?: string;
  limit?: number;
  cursor?: string;
}

export class LoyverseApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'LoyverseApiError';
    this.status = status;
    this.details = details;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function errorMessage(payload: unknown, status: number): string {
  const record = asRecord(payload);
  return asString(record?.message) || asString(record?.error) || `HTTP ${status}`;
}

function parseReceiptPage(payload: unknown): LoyverseReceiptPage {
  if (Array.isArray(payload)) {
    return { receipts: payload as LoyverseReceipt[] };
  }

  const record = asRecord(payload);
  const receipts = Array.isArray(record?.receipts) ? record.receipts as LoyverseReceipt[] : [];
  const cursor = asString(record?.cursor);

  return cursor ? { receipts, cursor } : { receipts };
}

function wait(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(5000, retryAfter * 1000);
  }

  return Math.min(5000, 500 * 2 ** attempt);
}

export function getLoyverseConfig(): LoyverseClientConfig {
  const apiToken = process.env.LOYVERSE_API_TOKEN?.trim();
  const storeId = process.env.LOYVERSE_STORE_ID?.trim();

  if (!apiToken || !storeId) {
    throw new Error(
      'Missing Loyverse configuration. Set LOYVERSE_API_TOKEN and LOYVERSE_STORE_ID in server-side environment variables.',
    );
  }

  return {
    apiToken,
    storeId,
    baseUrl: process.env.LOYVERSE_API_BASE_URL || LOYVERSE_API_BASE_URL,
    timeoutMs: Number(process.env.LOYVERSE_API_TIMEOUT_MS) || 30000,
  };
}

export class LoyverseClient {
  private readonly config: LoyverseClientConfig;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: LoyverseClientConfig) {
    this.config = config;
    this.baseUrl = (config.baseUrl || LOYVERSE_API_BASE_URL).replace(/\/$/, '');
    this.timeoutMs = config.timeoutMs || 30000;
  }

  get storeId(): string {
    return this.config.storeId;
  }

  private async request(url: URL): Promise<unknown> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${this.config.apiToken}`,
          },
          signal: controller.signal,
        });

        const body = await response.text();
        let payload: unknown = undefined;
        if (body) {
          try {
            payload = JSON.parse(body);
          } catch {
            payload = { message: body };
          }
        }

        if (response.ok) {
          return payload;
        }

        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < 2) {
          await wait(retryDelay(response, attempt));
          continue;
        }

        throw new LoyverseApiError(errorMessage(payload, response.status), response.status, payload);
      } catch (error) {
        lastError = error;
        if (error instanceof LoyverseApiError || attempt >= 2) {
          throw error;
        }
        await wait(500 * 2 ** attempt);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Loyverse request failed.');
  }

  async listReceipts(options: ListReceiptsOptions): Promise<LoyverseReceiptPage> {
    const url = new URL(`${this.baseUrl}/receipts`);
    const limit = Math.min(250, Math.max(1, options.limit || 250));

    url.searchParams.set('store_id', options.storeId);
    url.searchParams.set('limit', String(limit));
    if (options.createdAtMin) url.searchParams.set('created_at_min', options.createdAtMin);
    if (options.createdAtMax) url.searchParams.set('created_at_max', options.createdAtMax);
    if (options.updatedAtMin) url.searchParams.set('updated_at_min', options.updatedAtMin);
    if (options.updatedAtMax) url.searchParams.set('updated_at_max', options.updatedAtMax);
    if (options.cursor) url.searchParams.set('cursor', options.cursor);

    return parseReceiptPage(await this.request(url));
  }

  async getAllReceipts(
    options: Omit<ListReceiptsOptions, 'cursor'> & { maxPages?: number },
  ): Promise<{ receipts: LoyverseReceipt[]; pages: number }> {
    const { maxPages = 100, ...baseOptions } = options;
    const receipts: LoyverseReceipt[] = [];
    const seenCursors = new Set<string>();
    let cursor: string | undefined;
    let pages = 0;

    while (pages < maxPages) {
      const page = await this.listReceipts({ ...baseOptions, cursor });
      pages += 1;
      receipts.push(...page.receipts);

      if (!page.cursor || page.receipts.length === 0) {
        return { receipts, pages };
      }

      if (seenCursors.has(page.cursor)) {
        throw new Error('Loyverse returned a repeated pagination cursor.');
      }

      seenCursors.add(page.cursor);
      cursor = page.cursor;
    }

    throw new Error(`Loyverse receipt sync exceeded the ${maxPages}-page safety limit.`);
  }
}

export function createLoyverseClient(): LoyverseClient {
  return new LoyverseClient(getLoyverseConfig());
}
