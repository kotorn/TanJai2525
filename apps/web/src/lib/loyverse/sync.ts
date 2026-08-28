import { format, startOfDay, subDays } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import { createAdminClient } from '@/lib/supabase/admin';
import { createLoyverseClient, type LoyverseLineItem, type LoyverseReceipt, type LoyversePayment } from '@/lib/loyverse/client';

const DEFAULT_TIME_ZONE = 'Asia/Tokyo';
const DEFAULT_LOOKBACK_DAYS = 2;
const DEFAULT_MAX_PAGES = 100;
const BATCH_SIZE = 250;

type Row = Record<string, unknown>;

export interface LoyverseSyncWindow {
  timeZone: string;
  start: string;
  end: string;
}

export interface LoyverseSyncResult {
  storeId: string;
  timeZone: string;
  windowStart: string;
  windowEnd: string;
  pages: number;
  receiptsFetched: number;
  receiptsUpserted: number;
  linesUpserted: number;
  paymentsUpserted: number;
  skippedReceipts: number;
}

function envNumber(name: string, fallback: number, minimum: number, maximum: number): number {
  const value = Number.parseInt(process.env[name] || '', 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, value));
}

function asRecord(value: unknown): Row | null {
  return value !== null && typeof value === 'object' ? value as Row : null;
}

function asArray(value: unknown): Row[] {
  return Array.isArray(value) ? value.map(asRecord).filter((item): item is Row => item !== null) : [];
}

function stringAt(record: Row, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function numberAt(record: Row, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

function isoAt(record: Row, ...keys: string[]): string | null {
  const value = stringAt(record, ...keys);
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message.slice(0, 2000) : 'Unknown Loyverse sync error';
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

export function getLoyverseSyncWindow(now = new Date()): LoyverseSyncWindow {
  const timeZone = process.env.LOYVERSE_TIME_ZONE || DEFAULT_TIME_ZONE;
  const lookbackDays = envNumber('LOYVERSE_SYNC_LOOKBACK_DAYS', DEFAULT_LOOKBACK_DAYS, 0, 30);
  const localNow = toZonedTime(now, timeZone);
  const localStart = subDays(startOfDay(localNow), lookbackDays);
  const start = fromZonedTime(`${format(localStart, 'yyyy-MM-dd')}T00:00:00`, timeZone);

  return {
    timeZone,
    start: start.toISOString(),
    end: now.toISOString(),
  };
}

function receiptRow(receipt: LoyverseReceipt, storeId: string, tenantId: string | null, importedAt: string): Row | null {
  const record = asRecord(receipt);
  if (!record) return null;

  const receiptNumber = stringAt(record, 'receipt_number');
  if (!receiptNumber) return null;

  const receiptType = (stringAt(record, 'receipt_type') || 'UNKNOWN').toUpperCase();
  return {
    tenant_id: tenantId,
    store_id: storeId,
    receipt_number: receiptNumber,
    receipt_type: receiptType,
    receipt_date: isoAt(record, 'receipt_date'),
    created_at: isoAt(record, 'created_at'),
    updated_at: isoAt(record, 'updated_at'),
    source: stringAt(record, 'source'),
    order_name: stringAt(record, 'order', 'order_name'),
    customer_id: stringAt(record, 'customer_id'),
    employee_id: stringAt(record, 'employee_id'),
    total_money: numberAt(record, 'total_money'),
    total_tax: numberAt(record, 'total_tax'),
    total_discount: numberAt(record, 'total_discount', 'total_discounts', 'discounts_total'),
    total_gross_sales: numberAt(record, 'total_gross_sales', 'gross_sales'),
    total_cost: numberAt(record, 'total_cost', 'cost'),
    raw_payload: receipt,
    imported_at: importedAt,
  };
}

function lineRows(receipt: LoyverseReceipt, receiptId: string): Row[] {
  const record = asRecord(receipt);
  if (!record) return [];

  return asArray(record.line_items).map((line, lineIndex) => ({
    receipt_id: receiptId,
    line_index: lineIndex,
    external_line_id: stringAt(line, 'id'),
    item_id: stringAt(line, 'item_id'),
    variant_id: stringAt(line, 'variant_id'),
    item_name: stringAt(line, 'item_name'),
    variant_name: stringAt(line, 'variant_name'),
    quantity: numberAt(line, 'quantity') || 0,
    price: numberAt(line, 'price'),
    cost: numberAt(line, 'cost'),
    gross_total_money: numberAt(line, 'gross_total_money', 'gross_total'),
    total_money: numberAt(line, 'total_money', 'total'),
    raw_payload: line,
  }));
}

function paymentRows(receipt: LoyverseReceipt, receiptId: string): Row[] {
  const record = asRecord(receipt);
  if (!record) return [];

  return asArray(record.payments).map((payment, paymentIndex) => ({
    receipt_id: receiptId,
    payment_index: paymentIndex,
    external_payment_id: stringAt(payment, 'id'),
    payment_type_id: stringAt(payment, 'payment_type_id'),
    payment_type: stringAt(payment, 'payment_type', 'payment_type_name', 'type'),
    money: numberAt(payment, 'money', 'amount', 'money_amount'),
    raw_payload: payment,
  }));
}

async function upsertChunks(supabase: any, table: string, rows: Row[], onConflict: string): Promise<void> {
  for (const batch of chunks(rows, BATCH_SIZE)) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw new Error(`${table} upsert failed: ${error.message}`);
  }
}

async function deleteChildren(supabase: any, table: string, receiptIds: string[]): Promise<void> {
  for (const batch of chunks(receiptIds, BATCH_SIZE)) {
    const { error } = await supabase.from(table).delete().in('receipt_id', batch);
    if (error) throw new Error(`${table} cleanup failed: ${error.message}`);
  }
}

async function receiptIdsByNumber(supabase: any, storeId: string, receiptNumbers: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  for (const batch of chunks(receiptNumbers, BATCH_SIZE)) {
    const { data, error } = await supabase
      .from('loyverse_receipts')
      .select('id, receipt_number')
      .eq('store_id', storeId)
      .in('receipt_number', batch);

    if (error) throw new Error(`loyverse_receipts lookup failed: ${error.message}`);
    for (const row of data || []) {
      if (row.id && row.receipt_number) result.set(row.receipt_number, row.id);
    }
  }

  return result;
}

async function updateRun(supabase: any, runId: string, values: Row): Promise<void> {
  const { error } = await supabase.from('loyverse_sync_runs').update(values).eq('id', runId);
  if (error) throw new Error(`loyverse_sync_runs update failed: ${error.message}`);
}

export async function syncLoyverseReceipts(now = new Date()): Promise<LoyverseSyncResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for the server-side Loyverse sync.');
  }

  const client = createLoyverseClient();
  const storeId = client['config'].storeId;
  const tenantId = process.env.LOYVERSE_TENANT_ID?.trim() || null;
  const window = getLoyverseSyncWindow(now);
  const maxPages = envNumber('LOYVERSE_SYNC_MAX_PAGES', DEFAULT_MAX_PAGES, 1, 1000);
  const supabase = createAdminClient();
  const startedAt = new Date().toISOString();
  let runId: string | null = null;

  try {
    const { data: run, error: runError } = await supabase
      .from('loyverse_sync_runs')
      .insert({
        tenant_id: tenantId,
        store_id: storeId,
        window_start: window.start,
        window_end: window.end,
        lookback_days: envNumber('LOYVERSE_SYNC_LOOKBACK_DAYS', DEFAULT_LOOKBACK_DAYS, 0, 30),
        started_at: startedAt,
        status: 'running',
      })
      .select('id')
      .single();

    if (runError || !run?.id) {
      throw new Error(`Unable to start Loyverse sync run: ${runError?.message || 'missing run id'}`);
    }
    runId = run.id;

    const listing = await client.getAllReceipts({
      storeId,
      createdAtMin: window.start,
      createdAtMax: window.end,
      limit: 250,
      maxPages,
    });

    const importedAt = new Date().toISOString();
    const receiptMap = new Map<string, { source: LoyverseReceipt; row: Row }>();
    let skippedReceipts = 0;

    for (const receipt of listing.receipts) {
      const row = receiptRow(receipt, storeId, tenantId, importedAt);
      if (!row || typeof row.receipt_number !== 'string') {
        skippedReceipts += 1;
        continue;
      }
      receiptMap.set(row.receipt_number, { source: receipt, row });
    }

    const receipts = [...receiptMap.values()];
    const receiptRows = receipts.map(item => item.row);
    await upsertChunks(supabase, 'loyverse_receipts', receiptRows, 'store_id,receipt_number');

    const ids = await receiptIdsByNumber(supabase, storeId, receiptRows.map(row => row.receipt_number as string));
    const persistedIds = [...ids.values()];
    const lines = receipts.flatMap(item => {
      const id = ids.get(item.row.receipt_number as string);
      return id ? lineRows(item.source, id) : [];
    });
    const payments = receipts.flatMap(item => {
      const id = ids.get(item.row.receipt_number as string);
      return id ? paymentRows(item.source, id) : [];
    });

    if (persistedIds.length > 0) {
      await deleteChildren(supabase, 'loyverse_receipt_lines', persistedIds);
      await deleteChildren(supabase, 'loyverse_receipt_payments', persistedIds);
    }
    await upsertChunks(supabase, 'loyverse_receipt_lines', lines, 'receipt_id,line_index');
    await upsertChunks(supabase, 'loyverse_receipt_payments', payments, 'receipt_id,payment_index');

    const result: LoyverseSyncResult = {
      storeId,
      timeZone: window.timeZone,
      windowStart: window.start,
      windowEnd: window.end,
      pages: listing.pages,
      receiptsFetched: listing.receipts.length,
      receiptsUpserted: receiptRows.length,
      linesUpserted: lines.length,
      paymentsUpserted: payments.length,
      skippedReceipts,
    };

    await updateRun(supabase, runId, {
      status: 'succeeded',
      finished_at: new Date().toISOString(),
      pages: result.pages,
      receipts_fetched: result.receiptsFetched,
      receipts_upserted: result.receiptsUpserted,
      lines_upserted: result.linesUpserted,
      payments_upserted: result.paymentsUpserted,
      skipped_receipts: result.skippedReceipts,
    });

    return result;
  } catch (error) {
    if (runId) {
      try {
        await updateRun(supabase, runId, {
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: errorText(error),
        });
      } catch (updateError) {
        console.error('[Loyverse] Unable to record failed sync run', updateError);
      }
    }
    throw error;
  }
}
