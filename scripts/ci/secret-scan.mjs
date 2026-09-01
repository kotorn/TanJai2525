import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, writeJson } from './exec.mjs';

const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'coverage', 'playwright-report', 'test-results', '_artifacts', '_sources', '_secure-backups', '_legacy_backup']);
const TEXT_EXTENSIONS = new Set(['.cjs', '.css', '.env', '.example', '.gitignore', '.js', '.json', '.mjs', '.md', '.sql', '.toml', '.ts', '.tsx', '.txt', '.yml', '.yaml']);
const SECRET_PATTERNS = [
  /(?:access[_-]?token|api[_-]?key|client[_-]?secret|password|private[_-]?key|service[_-]?role)\s*["'`]?\s*[:=]\s*["'`][A-Za-z0-9_./+=-]{12,}["'`]/i,
  /(?:access[_-]?token|api[_-]?key|client[_-]?secret|password|private[_-]?key|service[_-]?role)\s*["'`]?\s*=\s*(?!process\.env\b)(?!secrets\.)[A-Za-z0-9_+=/-]{12,}(?:\s|;|,|$)/i,
];

function walk(directory, files = []) {
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath, files);
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) || entry.name.startsWith('.env')) files.push(filePath);
  }
  return files;
}

function main() {
  const findings = [];
  for (const filePath of walk(ROOT)) {
    const relative = path.relative(ROOT, filePath).replaceAll(path.sep, '/');
    if (relative === '.env.example') continue;
    const source = fs.readFileSync(filePath, 'utf8');
    source.split(/\r?\n/).forEach((line, index) => {
      if (SECRET_PATTERNS.some((pattern) => pattern.test(line)) && !/process\.env|secrets\.|your[-_]|placeholder|example/i.test(line)) findings.push(`${relative}:${index + 1}`);
    });
  }
  const result = { scanner: 'static', status: findings.length ? 'fail' : 'ok', findings };
  writeJson('secret-scan-summary.json', result);
  if (findings.length) console.error(`SECRET_SCAN findings=${findings.join(',')}`);
  console.log(`SECRET_SCAN status=${result.status} scanner=static`);
  process.exitCode = findings.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
