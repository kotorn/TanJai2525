---
description: Deployment and Version Compatibility Workflow
---

# Deployment & Dependency Checklist

## Critical Dependency Versions
Verified stable configuration for Next.js 14 App Router + Supabase (Monorepo):

| Package | Version | Notes |
| :--- | :--- | :--- |
| `next` | `14.2.xx` | Stable. Avoid v15 beta for now. |
| `@supabase/ssr` | `^0.5.1` | Must be 0.5.x for Next 14. 0.8.x breaks webpack. |
| `@supabase/supabase-js` | `^2.89.0` | Latest. Lower versions (2.47-2.87) may have ESM issues. |

## Configuration Overrides
To prevent build failures, ensure these settings are active:

1.  **Root `package.json` overrides**:
    ```json
    "overrides": {
      "@supabase/supabase-js": "^2.89.0"
    }
    ```

2.  **Web App `next.config.mjs`**:
    *   **REMOVE** `@supabase/*` from `transpilePackages`.
    *   **ADD** `serverComponentsExternalPackages`:
        ```javascript
        experimental: {
            serverComponentsExternalPackages: ['@supabase/ssr', '@supabase/supabase-js'],
        }
        ```

## Deployment Workflow (Vercel)

1.  **Check Dependencies**:
    `npm list @supabase/supabase-js` -> Ensure it matches ^2.89.0.

2.  **Local Build Verification**:
    `npx turbo run build --filter=web` -> MUST pass locally before pushing.

3.  **Push to Deploy**:
    `git push origin main`

4.  **Troubleshooting**:
    If build fails with `Attempted import error: wrapper.mjs`:
    -   Check if a rogue `transpilePackages` entry exists.
    -   Verify `serverComponentsExternalPackages` is active.
    -   Force re-install: `rm -rf node_modules package-lock.json && npm install`.
