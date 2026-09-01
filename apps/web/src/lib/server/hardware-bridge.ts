export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ReceiptPayload {
  id: string;
  tableId?: string | number | null;
  totalAmount: number;
  items: ReceiptItem[];
}

interface BridgeResponse {
  success: boolean;
  error?: string;
}

function bridgeConfig() {
  const bridgeUrl = String(process.env.NEXT_PUBLIC_HARDWARE_BRIDGE_URL || 'http://localhost:8080').replace(/\/$/, '');
  const bridgeToken = String(process.env.HARDWARE_BRIDGE_TOKEN || '').trim();

  if (!bridgeToken) {
    throw new Error('Hardware bridge is not configured');
  }

  try {
    const parsed = new URL(bridgeUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported protocol');
  } catch {
    throw new Error('Hardware bridge URL is invalid');
  }

  return { bridgeUrl, bridgeToken };
}

async function callBridge(path: string, init: RequestInit = {}): Promise<BridgeResponse> {
  const { bridgeUrl, bridgeToken } = bridgeConfig();
  const response = await fetch(`${bridgeUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      Authorization: `Bearer ${bridgeToken}`,
    },
    signal: AbortSignal.timeout(10_000),
  });

  let data: BridgeResponse = { success: false };
  try {
    data = await response.json() as BridgeResponse;
  } catch {
    // Return a safe, non-sensitive error below for a non-JSON bridge response.
  }

  if (!response.ok || !data.success) {
    return { success: false, error: data.error || 'Hardware bridge request failed' };
  }

  return { success: true };
}

export function isReceiptPayload(value: unknown): value is ReceiptPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Partial<ReceiptPayload>;
  if (typeof payload.id !== 'string' || payload.id.length < 1 || payload.id.length > 128) return false;
  if (typeof payload.totalAmount !== 'number' || !Number.isFinite(payload.totalAmount)) return false;
  if (!Array.isArray(payload.items) || payload.items.length > 100) return false;

  return payload.items.every((item) => (
    !!item
    && typeof item.name === 'string'
    && item.name.length > 0
    && item.name.length <= 200
    && typeof item.quantity === 'number'
    && Number.isFinite(item.quantity)
    && item.quantity > 0
    && typeof item.price === 'number'
    && Number.isFinite(item.price)
  ));
}

export function printReceipt(payload: ReceiptPayload) {
  return callBridge('/print-receipt', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
