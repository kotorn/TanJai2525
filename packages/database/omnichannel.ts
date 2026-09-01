export const CHANNEL_PROVIDERS = [
  'meta_catalog',
  'line_oa',
  'google_business_profile',
  'tiktok_shop',
] as const;

export type ChannelProvider = (typeof CHANNEL_PROVIDERS)[number];

export type OrderChannelSource =
  | 'pos'
  | 'liff'
  | 'line_oa'
  | 'facebook_messenger'
  | 'facebook_catalog'
  | 'instagram'
  | 'google_business_profile'
  | 'tiktok_shop'
  | 'tiktok';

export type CatalogItem = {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string | null;
  categoryName?: string | null;
  price: number;
  currency: string;
  isAvailable: boolean;
  stockQuantity?: number | null;
  imageUrl?: string | null;
  productUrl: string;
  updatedAt?: string | null;
};

export type NormalizedOrderItem = {
  externalLineId?: string;
  catalogItemId?: string;
  sku?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  options?: Record<string, unknown>;
};

export type NormalizedExternalOrder = {
  provider: ChannelProvider;
  externalOrderId: string;
  idempotencyKey: string;
  tenantId: string;
  items: NormalizedOrderItem[];
  totalAmount: number;
  currency: string;
  status: string;
  customer?: {
    externalId?: string;
    displayName?: string;
    email?: string;
    phone?: string;
  };
  rawMetadata?: Record<string, unknown>;
};

export type NormalizedEvent = {
  provider: ChannelProvider;
  eventId: string;
  eventType: string;
  order?: NormalizedExternalOrder;
  receivedAt: string;
  rawMetadata?: Record<string, unknown>;
};

export type ExternalOrderBatch = {
  orders: NormalizedExternalOrder[];
  nextCursor?: string;
};

export type ConfigResult = {
  ok: boolean;
  missing?: string[];
  details?: string;
};

export type SyncResult = {
  ok: boolean;
  attempted: number;
  succeeded: number;
  failed: number;
  errors: Array<{ itemId?: string; message: string }>;
  dryRun?: boolean;
};

export interface ChannelAdapter {
  readonly provider: ChannelProvider;
  validateConfig(): Promise<ConfigResult>;
  publishCatalog(items: CatalogItem[], options?: { dryRun?: boolean }): Promise<SyncResult>;
  receiveWebhook?(request: Request): Promise<NormalizedEvent>;
  importOrders(cursor?: string): Promise<ExternalOrderBatch>;
  normalizeWebhook?(payload: unknown, context?: { tenantId?: string }): NormalizedEvent | null;
}

export interface MessagingChannelAdapter extends ChannelAdapter {
  sendMessage(recipientId: string, message: string): Promise<{ ok: boolean; externalMessageId?: string; error?: string }>;
}

export function buildIdempotencyKey(provider: ChannelProvider, accountId: string, externalEventId: string) {
  return `${provider}:${accountId}:${externalEventId}`;
}

export function normalizeCatalogItem(item: CatalogItem): CatalogItem {
  return {
    ...item,
    sku: item.sku.trim() || item.id,
    name: item.name.trim(),
    price: Number(item.price),
    currency: item.currency.trim().toUpperCase() || 'JPY',
    isAvailable: Boolean(item.isAvailable) && (item.stockQuantity == null || item.stockQuantity > 0),
    productUrl: item.productUrl.trim(),
  };
}
