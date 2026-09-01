import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));
export const ARTIFACT_DIR = path.join(ROOT, '_artifacts', 'ci');
export const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
export const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';
export const GIT = process.platform === 'win32' ? 'git.exe' : 'git';

export function ensureArtifactDir() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  return ARTIFACT_DIR;
}

function isCompact() {
  return process.env.COMPACT_LOGS === '1' || process.env.CI === 'true' || process.env.CI === '1';
}

function secretValues(env) {
  return Object.entries(env)
    .filter(([name, value]) => /(TOKEN|KEY|SECRET|PASSWORD|CREDENTIAL|AUTH)/i.test(name) && typeof value === 'string' && value.length >= 4)
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
}

export function redactSecrets(value, env = process.env) {
  let redacted = String(value ?? '');
  for (const secret of secretValues(env)) redacted = redacted.split(secret).join('[REDACTED]');
  return redacted;
}

function tail(value, maxLines = 80, maxChars = 8000) {
  const lines = value.split(/\r?\n/);
  return lines.slice(Math.max(0, lines.length - maxLines)).join('\n').slice(-maxChars);
}

function safeLabel(label) {
  return String(label).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'command';
}

function commandInvocation(command, args) {
  if (process.platform === 'win32' && /\.(cmd|ps1)$/i.test(command)) {
    const shim = path.basename(command).toLowerCase();
    const cliName = shim.startsWith('npx') ? 'npx-cli.js' : 'npm-cli.js';
    const cliPath = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', cliName);
    if (fs.existsSync(cliPath)) return { command: process.execPath, args: [cliPath, ...args], shell: false };
    return { command, args, shell: true };
  }
  return { command, args, shell: false };
}

export function relativeArtifactPath(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, '/');
}

export function writeJson(name, value) {
  const filePath = path.join(ensureArtifactDir(), name);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return filePath;
}

export function requireEnv(names, context = 'command', env = process.env) {
  const missing = names.filter((name) => !String(env[name] ?? '').trim());
  if (missing.length > 0) throw new Error(`${context}: missing required environment names: ${missing.join(', ')}`);
}

export async function runCommand(label, command, args = [], options = {}) {
  const logPath = path.join(ensureArtifactDir(), `${safeLabel(label)}.log`);
  const commandEnv = { ...process.env, ...(options.env ?? {}) };
  const output = [];
  const invocation = commandInvocation(command, args);
  let spawnError = null;

  const exitCode = await new Promise((resolve) => {
    let child;
    try {
      child = spawn(invocation.command, invocation.args, {
        cwd: options.cwd ?? ROOT,
        env: commandEnv,
        shell: invocation.shell,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      spawnError = error;
      resolve(1);
      return;
    }

    child.stdout.on('data', (chunk) => output.push(String(chunk)));
    child.stderr.on('data', (chunk) => output.push(String(chunk)));
    child.on('error', (error) => { spawnError = error; resolve(1); });
    child.on('close', (code) => resolve(typeof code === 'number' ? code : 1));
  });

  const rawOutput = output.join('');
  const safeOutput = redactSecrets(spawnError ? `${rawOutput}\n${spawnError.message}` : rawOutput, commandEnv);
  fs.writeFileSync(logPath, safeOutput, 'utf8');

  if (exitCode === 0) {
    console.log(`STEP ${label}: ok (log=${relativeArtifactPath(logPath)})`);
  } else {
    console.error(`STEP ${label}: failed (exit=${exitCode}; log=${relativeArtifactPath(logPath)})`);
    if (!isCompact() || options.showFailureTail !== false) {
      const diagnostic = tail(safeOutput);
      if (diagnostic.trim()) console.error(diagnostic);
    }
  }

  return { code: exitCode, stdout: rawOutput, stderr: '', logPath, error: spawnError };
}
