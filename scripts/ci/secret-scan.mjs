import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { GIT, ROOT, writeJson } from './exec.mjs';

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

function isTextPath(relative) {
  const normalized = relative.replaceAll('\\', '/');
  const extension = path.posix.extname(normalized).toLowerCase();
  return TEXT_EXTENSIONS.has(extension) || path.posix.basename(normalized).startsWith('.env');
}

function gitOutput(args) {
  try {
    return execFileSync(GIT, args, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function gitBlob(commit, relative) {
  try {
    return execFileSync(GIT, ['show', `${commit}:${relative}`], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function scanSource(relative, source, findings, locationPrefix = '') {
  if (relative === '.env.example') return;
  source.split(/\r?\n/).forEach((line, index) => {
    if (SECRET_PATTERNS.some((pattern) => pattern.test(line)) && !/process\.env|secrets\.|your[-_]|placeholder|example/i.test(line)) {
      findings.add(`${locationPrefix}${relative}:${index + 1}`);
    }
  });
}

function scanWorkingTree(findings) {
  for (const filePath of walk(ROOT)) {
    const relative = path.relative(ROOT, filePath).replaceAll(path.sep, '/');
    scanSource(relative, fs.readFileSync(filePath, 'utf8'), findings);
  }
}

function scanPullRequestHistory(findings) {
  const baseRef = String(process.env.GITHUB_BASE_REF || '').trim();
  if (!baseRef) return;

  const baseCommit = gitOutput(['rev-parse', '--verify', `origin/${baseRef}`]).trim();
  if (!baseCommit) {
    findings.add(`history:unavailable:origin/${baseRef}`);
    return;
  }

  const commits = gitOutput(['rev-list', `${baseCommit}..HEAD`])
    .split(/\r?\n/)
    .map((commit) => commit.trim())
    .filter(Boolean);

  for (const commit of commits) {
    const files = gitOutput(['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', '-m', commit])
      .split(/\r?\n/)
      .map((relative) => relative.trim())
      .filter((relative) => relative && isTextPath(relative));

    for (const relative of new Set(files)) {
      const source = gitBlob(commit, relative);
      if (source !== null) scanSource(relative, source, findings, `history:${commit.slice(0, 12)}:`);
    }
  }
}

function main() {
  const findings = new Set();
  scanWorkingTree(findings);
  scanPullRequestHistory(findings);
  const resultFindings = [...findings].sort();
  const result = { scanner: process.env.GITHUB_BASE_REF ? 'static+pull-request-history' : 'static', status: resultFindings.length ? 'fail' : 'ok', findings: resultFindings };
  writeJson('secret-scan-summary.json', result);
  if (resultFindings.length) console.error(`SECRET_SCAN findings=${resultFindings.join(',')}`);
  console.log(`SECRET_SCAN status=${result.status} scanner=${result.scanner}`);
  process.exitCode = resultFindings.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
