import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, writeJson } from './exec.mjs';

const SOURCE_EXTENSIONS = new Set(['.cjs', '.js', '.jsx', '.mjs', '.mts', '.cts', '.ts', '.tsx']);
const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'coverage', 'playwright-report', 'test-results', '_artifacts', '_sources', '_secure-backups', '_legacy_backup']);
const BUILT_IN_NAMES = new Set([
  'BASE_URL', 'CI', 'NODE_ENV', 'NODE_OPTIONS', 'PORT', 'PATH', 'PATHEXT', 'VERCEL_URL',
  'GITHUB_ACTIONS', 'GITHUB_BASE_REF', 'GITHUB_EVENT_NAME', 'GITHUB_HEAD_REF', 'GITHUB_OUTPUT',
  'GITHUB_REF_NAME', 'GITHUB_REPOSITORY', 'GITHUB_SHA', 'RUNNER_TEMP',
]);

function readEnvNames(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  const names = new Set();
  for (const match of fs.readFileSync(filePath, 'utf8').matchAll(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/gm)) names.add(match[1]);
  return names;
}

function walkSources(directory, files = []) {
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkSources(filePath, files);
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(filePath);
  }
  return files;
}

export function findEnvReferences() {
  const references = new Map();
  for (const filePath of walkSources(ROOT)) {
    const source = fs.readFileSync(filePath, 'utf8');
    for (const pattern of [/process\.env\.([A-Z][A-Z0-9_]*)/g, /process\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/g]) {
      for (const match of source.matchAll(pattern)) {
        const name = match[1];
        if (!references.has(name)) references.set(name, []);
        references.get(name).push(path.relative(ROOT, filePath).replaceAll(path.sep, '/'));
      }
    }
  }
  return references;
}

function parseEnvValue(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1);
  return trimmed.replace(/\s+#.*$/, '');
}

function readEnvFile(filePath) {
  const values = {};
  if (!fs.existsSync(filePath)) return values;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match) values[match[1]] = parseEnvValue(match[2]);
  }
  return values;
}

function effectiveEnvironment() {
  const values = {};
  for (const fileName of [
    '.env',
    '.env.local',
    '.env.development',
    '.env.development.local',
    '.env.preview',
    '.env.preview.local',
    '.env.staging',
    '.env.staging.local',
    '.env.production',
    '.env.production.local',
  ]) {
    Object.assign(values, readEnvFile(path.join(ROOT, fileName)));
  }
  const pulledEnvironment = String(process.env.VERCEL_PULL_ENV || process.env.APP_ENV || '').trim();
  if (pulledEnvironment) {
    Object.assign(values, readEnvFile(path.join(ROOT, '.vercel', `.env.${pulledEnvironment}.local`)));
  }
  Object.assign(values, process.env);
  return values;
}

function isPlaceholder(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return !normalized || normalized.includes('your-') || normalized.includes('your_') || normalized.includes('placeholder') || normalized.includes('example.supabase') || normalized.startsWith('<') || normalized === 'change_me' || normalized === 'changeme';
}

function publicSecretLike(name) {
  if (name === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') return false;
  return name.startsWith('NEXT_PUBLIC_') && /(TOKEN|KEY|SECRET|PASSWORD|CREDENTIAL|AUTH)/i.test(name);
}

export function validateNames() {
  const documented = readEnvNames(path.join(ROOT, '.env.example'));
  const references = findEnvReferences();
  const undocumented = [...references.keys()].filter((name) => !documented.has(name) && !BUILT_IN_NAMES.has(name)).sort();
  const publicSecrets = [...references.keys()].filter(publicSecretLike).sort();
  const result = {
    documentedCount: documented.size,
    referencedCount: references.size,
    undocumented,
    publicSecrets,
    status: undocumented.length || publicSecrets.length ? 'fail' : 'ok',
  };
  writeJson('env-contract-summary.json', result);
  if (undocumented.length) console.error(`ENV_NAMES undocumented: ${undocumented.join(', ')}`);
  if (publicSecrets.length) console.error(`ENV_NAMES public-secret-like: ${publicSecrets.join(', ')}`);
  return result;
}

export function validateRuntime() {
  const env = effectiveEnvironment();
  const appEnv = String(env.APP_ENV ?? '').trim();
  const schema = String(env.SUPABASE_SCHEMA ?? '').trim();
  const publicSchema = String(env.NEXT_PUBLIC_SUPABASE_SCHEMA ?? '').trim();
  const required = ['APP_ENV', 'SUPABASE_SCHEMA', 'NEXT_PUBLIC_SUPABASE_SCHEMA', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  if (appEnv !== 'local' && appEnv !== 'preview') required.push('SUPABASE_SERVICE_ROLE_KEY');
  if (appEnv === 'staging' || appEnv === 'production') required.push('CRON_SECRET');
  const missing = required.filter((name) => isPlaceholder(env[name]));
  const errors = [];
  if (!['local', 'preview', 'staging', 'production'].includes(appEnv)) errors.push('APP_ENV must be local, preview, staging, or production');
  if (schema !== 'public') errors.push('SUPABASE_SCHEMA must remain public until the reviewed expand/contract schema migration is deployed');
  if (publicSchema !== schema) errors.push('NEXT_PUBLIC_SUPABASE_SCHEMA must match SUPABASE_SCHEMA');
  if (!isPlaceholder(env.NEXT_PUBLIC_SUPABASE_URL)) {
    try {
      const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
      if (url.protocol !== 'https:' && appEnv !== 'local') errors.push('NEXT_PUBLIC_SUPABASE_URL must use HTTPS outside local');
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    }
  }
  const names = validateNames();
  const result = { mode: 'runtime', appEnv: appEnv || null, requiredCount: required.length, missing, errors: [...errors, ...(names.status === 'fail' ? ['environment name contract failed'] : [])], status: missing.length || errors.length || names.status === 'fail' ? 'fail' : 'ok' };
  writeJson('env-runtime-summary.json', result);
  if (missing.length) console.error(`ENV_RUNTIME missing names: ${missing.join(', ')}`);
  for (const error of errors) console.error(`ENV_RUNTIME ${error}`);
  console.log(`ENV_SUMMARY mode=runtime app_env=${appEnv || 'unset'} required=${required.length} missing=${missing.length} status=${result.status}`);
  return result;
}

const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = modeArg ? modeArg.slice('--mode='.length) : 'names';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = mode === 'runtime' ? validateRuntime() : validateNames();
  if (mode !== 'runtime') console.log(`ENV_SUMMARY mode=names documented=${result.documentedCount} referenced=${result.referencedCount} status=${result.status}`);
  process.exitCode = result.status === 'ok' ? 0 : 1;
}
