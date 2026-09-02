# TanJai POS CI/CD and release gates

The canonical repository is `kotorn/TanJai2525`. Pull requests run affected checks and a same-repository Vercel preview when the preview environment is configured. A push to `main` runs the protected staging workflow. Production is a manual workflow dispatch after staging evidence and environment approval.

## Required environment values

Keep all values in GitHub Environments or Vercel. Never commit credentials or copy production values into the repository.

| Environment | Required configuration |
| --- | --- |
| CI | public-only Supabase URL/key placeholders supplied by the workflow |
| Preview | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, public Supabase URL/key |
| Staging | Preview values plus `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `CRON_SECRET` |
| Production | Staging values plus protected `SUPABASE_PRODUCTION_APPROVED=1` and a required reviewer environment |

Server-only values include `SUPABASE_SERVICE_ROLE_KEY`, provider access tokens, OAuth refresh tokens and `CRON_SECRET`. Browser code may only receive `NEXT_PUBLIC_*` values that are intentionally public.

## Release flow

```text
pull request
  -> affected lint/type-check/build + secret scan
  -> Vercel preview + browser smoke
  -> review and squash merge
main push
  -> Supabase dry-run -> apply staging migration
  -> Vercel prebuilt staging deployment -> browser smoke
manual production dispatch
  -> protected approval -> dry-run -> apply -> build -> smoke -> promote same artifact
```

The deployment wrappers refuse remote database operations without explicit guard variables. Production migration also requires protected approval metadata. Vercel is always built and deployed as a prebuilt artifact so the artifact tested by smoke is the one promoted.

## Local commands

```powershell
npm ci --ignore-scripts --no-audit --fund=false
npm run ci:doctor
npm run env:check
npm run ci:check
```

`npm run db:local` is the explicit local Supabase reset path. Do not use `supabase db reset --linked`.

## Failure reporting

Wrappers write redacted logs and JSON summaries to ignored `_artifacts/ci/`. Report the failed step, commit SHA, deployment URL and artifact path; never report token values or raw environment contents.
