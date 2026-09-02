# Server secret inventory

This file records names and ownership only. Values belong in the GitHub or Vercel environment that runs the integration.

| Name group | Owner | Runtime use |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` | platform | server database administration and guarded migrations |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | platform | prebuilt preview/staging/production deployment |
| `CRON_SECRET` | platform | scheduled route authentication |
| `FACEBOOK_APP_SECRET`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_VERIFY_TOKEN` | social | Meta webhook/catalog operations |
| `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET` | social | LINE Messaging API and webhook verification |
| `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | social | Google Business Profile OAuth |
| `TIKTOK_APP_SECRET`, `TIKTOK_ACCESS_TOKEN`, `TIKTOK_SHOP_CIPHER` | social | TikTok Shop API and reconciliation |

Never put these values in source, client bundles, query strings, logs, issue comments or pull requests. Rotate a credential if it is exposed.
