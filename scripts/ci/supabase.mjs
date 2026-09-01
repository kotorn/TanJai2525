import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NPX, requireEnv, runCommand, writeJson } from './exec.mjs';

function cliArgs(args) {
  return ['--no-install', 'supabase', ...args];
}

function remoteGuard(mode) {
  requireEnv(['SUPABASE_PROJECT_REF', 'SUPABASE_ACCESS_TOKEN', 'SUPABASE_DB_PASSWORD'], `supabase ${mode}`);
  if (mode === 'dry-run' && process.env.SUPABASE_ALLOW_REMOTE_DRY_RUN !== '1') throw new Error('supabase dry-run requires SUPABASE_ALLOW_REMOTE_DRY_RUN=1');
  if (mode === 'apply' && process.env.SUPABASE_ALLOW_REMOTE_APPLY !== '1') throw new Error('supabase apply requires SUPABASE_ALLOW_REMOTE_APPLY=1');
  if (mode === 'apply' && process.env.APP_ENV === 'production' && process.env.SUPABASE_PRODUCTION_APPROVED !== '1') throw new Error('production Supabase apply requires protected approval metadata');
}

function checkSchema() {
  const schema = String(process.env.SUPABASE_SCHEMA || 'public').trim();
  if (schema !== 'public') throw new Error('SUPABASE_SCHEMA must remain public until an expand/contract migration is reviewed and deployed');
}

async function local() {
  const start = await runCommand('supabase-start-local', NPX, cliArgs(['start']));
  if (start.code !== 0) return 1;
  const reset = await runCommand('supabase-reset-local', NPX, cliArgs(['db', 'reset', '--local', '--yes']));
  return reset.code;
}

async function remote(mode) {
  remoteGuard(mode);
  checkSchema();
  const linked = await runCommand('supabase-link', NPX, cliArgs(['link', '--project-ref', process.env.SUPABASE_PROJECT_REF, '--password', process.env.SUPABASE_DB_PASSWORD]));
  if (linked.code !== 0) return linked.code;
  const args = ['db', 'push', mode === 'dry-run' ? '--dry-run' : '--yes', '--linked'];
  const result = await runCommand(`supabase-db-${mode}`, NPX, cliArgs(args));
  const summary = { mode, status: result.code === 0 ? 'ok' : 'fail', log: path.relative(process.cwd(), result.logPath).replaceAll(path.sep, '/') };
  writeJson(`supabase-${mode}-summary.json`, summary);
  console.log(`SUPABASE_SUMMARY mode=${mode} status=${summary.status} log=${summary.log}`);
  return result.code;
}

async function main() {
  const mode = process.argv[2] || 'local';
  if (mode === 'local') process.exitCode = await local();
  else if (mode === 'dry-run' || mode === 'apply') process.exitCode = await remote(mode);
  else throw new Error(`Unknown Supabase mode: ${mode}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`SUPABASE_ERROR ${error.message}`);
    process.exitCode = 1;
  });
}
