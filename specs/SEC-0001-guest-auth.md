# SEC-0001: Guest Authentication Strategy

**Owner:** Guardian Sec
**Status:** DRAFT

## Objective
Identify unique customers and maintain secure sessions without forcing a Login screen.

## Strategy: "Trust on First Use" (TOFU)

### 1. Identity Creation
- **Trigger**: User scans QR or visits link.
- **Action**: Server generates a `guest_uuid`.
- **Token**: Mint a JWT `{ sub: guest_uuid, role: 'anon', exp: 24h }`.
- **Cookie**: HTTPOnly, Secure `sb-access-token`.

### 2. Device Fingerprinting (Fraud Prevention)
- **Library**: `@fingerprintjs/fingerprintjs`.
- **Usage**: Collect Browser/OS/Screen signals hash.
- **Check**: When placing order, send Hash.
- **Rule**: If 1 Hash > 5 active Guest IDs in 10 mins -> Flag as "Bot/Spam".

### 3. Session Upgrade
- If Guest pays via Credit Card -> Link `guest_uuid` to `customer_profile`.
- If Guest gives Phone Number -> Promote to "Member".

## Security Controls
- **Rate Limit**: Max 10 orders per Guest ID per hour.
- **Geofence**: (Future) Verify GPS matches Restaurant coordinates.
