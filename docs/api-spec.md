# Tanjai POS API Documentation (Phase 1.5)

## Overview
This document specifies the internal and external API endpoints for Tanjai POS.
Base URL: `http://localhost:3000` (Web) / `http://localhost:3001` (Tanjai-2525)

## Security
All internal endpoints require the following header:
- `x-tanjai-api-key`: Your internal API key.

Rate limiting is enforced at 60 requests per minute per IP.

---

### 1. Order Ingestion API
**Endpoint:** `POST /api/order/submit` (apps/web)  
**Description:** Persists a new order and routes items to kitchen stations.

**Payload:**
```json
{
  "restaurantId": "uuid",
  "tableId": "t1",
  "guestId": "optional-uuid",
  "items": [
    {
      "menuItemId": "uuid",
      "name": "Fried Rice",
      "quantity": 1,
      "price": 60,
      "category": "Main",
      "notes": "No spicy"
    }
  ]
}
```

---

### 2. Babel Translation API
**Endpoint:** `POST /api/babel-order` (apps/web)  
**Description:** Translates order text into the target language using Google Translate.

**Payload:**
```json
{
  "text": "Fried Rice",
  "targetLang": "my"
}
```

---

### 3. Loyverse Sync API
**Endpoint:** `GET /api/loyverse` (apps/tanjai-2525)  
**Description:** Manually triggers product synchronization from Loyverse POS to Supabase.

---

### 4. QA Seed API
**Endpoint:** `GET /api/qa-seed` (apps/web)  
**Description:** Seeds the database with mock data for testing.
