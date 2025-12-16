# VIS-0001: Smart QR Specification

**Owner:** Visionary
**Status:** DRAFT

## Objective
Enable a "Context-Aware" entry point where scanning a single QR Code immediately identifies the exact Table and Branch without user input.

## Technical Logic

### 1. URL Structure
`https://tanjai.app/q/[token]`

- **Note**: Short URL is critical for higher QR density and scanning speed.

### 2. Token Payload (JWT)
The `token` is a signed JWT containing:
```json
{
  "b": "branch_uuid",  // Minimize payload size (b = branch)
  "t": "table_uuid",   // t = table
  "e": 1735689600,     // e = exp (Standard JWT expiration)
  "s": "signature"
}
```

### 3. Redirection Flow
1.  **Scan**: User scans QR.
2.  **Middleware`: Edge Function validates signature and expiry.
    - If valid: Set `context` cookie -> Redirect to PWA `/menu`.
    - If expired: Redirect to `/expire-refresh`.
    - If invalid: Redirect to Home.

### 4. Zero-Friction Feature
- The app reads the `context` cookie on load.
- **Header**: "Welcome to Table 5 @ Siam Branch".
- **Menu**: Loads specific menu availability for that branch.
