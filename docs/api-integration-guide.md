# 🔌 API Integration Guide

## Overview
This guide defines standards for creating internal API routes and integrating with external services.

## 1. Internal API Routes (Next.js App Router)

Located in `app/api/...`.

### Standards
- **RESTful Design**: Use standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`).
- **Response Format**:
  ```json
  {
    "data": { ... },     // Success payload
    "error": null        // Error details if any
  }
  ```
- **Error Handling**: Use appropriate HTTP status codes.
  - 200: OK
  - 400: Bad Request (Validation error)
  - 401: Unauthorized
  - 403: Forbidden (RLS/Role failure)
  - 500: Internal Server Error

### Authentication
- All API routes must verify the Supabase session:
  ```ts
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  ```

## 2. External Integrations

### Rate Limiting
- Use `upstash/ratelimit` or similar middleware if exposing APIs to third parties.
- Standard limit: 100 requests / minute / IP.

### Webhooks
- **Stripe/Payment Gateways**:
  - Endpoint: `/api/webhooks/stripe`.
  - Security: Verify signature header to ensure authenticity.
  - Idempotency: Handle duplicate webhook events gracefully.

## 3. Deprecation Policy
- Do not make breaking changes to stable API versions.
- If a breaker is needed, introduce a new version path (e.g., `/api/v2/...`).

## 4. Documentation
- Use OpenAPI/Swagger if public API surface grows.
- Keep this guide updated with new endpoints.
