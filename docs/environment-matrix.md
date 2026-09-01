# TanJai2525 environment matrix

The application currently uses the `public` Supabase schema. Environment-specific schemas are intentionally deferred until a reviewed expand/contract migration moves existing tables and updates the client schema configuration. The CI contract still carries `APP_ENV` and `SUPABASE_SCHEMA` so that future schema isolation cannot be introduced accidentally.

| Environment | Application target | Supabase schema | Allowed path |
| --- | --- | --- | --- |
| Local | Next.js local | `public` | local CLI only |
| Preview | Vercel Preview | `public` | same-repository pull request |
| Staging | Vercel Preview branch `staging` | `public` | push to `main` or manual staging dispatch |
| Production | Vercel Production | `public` | manual production dispatch after reviewer approval |

## Invariants

- `APP_ENV`, `SUPABASE_SCHEMA` and `NEXT_PUBLIC_SUPABASE_SCHEMA` must be present and equal.
- `SUPABASE_SCHEMA` is server-side configuration and is never accepted from a browser request.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Remote migration jobs must dry-run before apply.
- Production promotion uses the exact smoke-tested deployment URL.
- No credential, token or customer export belongs in the repository.
