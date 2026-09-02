import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NPM, NPX, ROOT, runCommand, writeJson } from './exec.mjs';

function packageHasUnitTests() {
  const packageFiles = [
    path.join(ROOT, 'package.json'),
    ...['apps', 'packages'].flatMap((folder) => {
      const directory = path.join(ROOT, folder);
      if (!fs.existsSync(directory)) return [];
      return fs.readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(directory, entry.name, 'package.json'));
    }),
  ];
  return packageFiles.some((filePath) => {
    if (!fs.existsSync(filePath)) return false;
    try { return Boolean(JSON.parse(fs.readFileSync(filePath, 'utf8')).scripts?.test); } catch { return false; }
  });
}

async function step(label, command, args, options = {}) {
  const result = await runCommand(label, command, args, options);
  return result.code === 0;
}

async function runUnit() {
  if (!packageHasUnitTests()) {
    console.log('STEP unit-tests: skipped (no workspace test script)');
    return true;
  }
  return step('unit-tests', NPX, ['--no-install', 'turbo', 'run', 'test', '--no-color']);
}

async function execute(mode, steps) {
  const failed = [];
  for (const [label, command, args] of steps) {
    if (label === 'unit-tests' && command === null) {
      if (!(await runUnit())) { failed.push(label); break; }
      continue;
    }
    if (!(await step(label, command, args))) { failed.push(label); break; }
  }
  const result = { mode, status: failed.length ? 'fail' : 'ok', failedStep: failed[0] ?? null };
  writeJson(`ci-${mode}-summary.json`, result);
  console.log(`CI_SUMMARY mode=${mode} status=${result.status} failed_step=${result.failedStep ?? 'none'}`);
  return failed.length ? 1 : 0;
}

async function runMode(mode) {
  const steps = [['doctor', NPM, ['run', 'ci:doctor']]];
  if (mode !== 'doctor') steps.push(['secret-scan', NPM, ['run', 'security:scan']]);
  if (mode === 'check') {
    steps.push(['lint', NPM, ['run', 'lint']]);
    steps.push(['type-check', NPM, ['run', 'type-check']]);
    steps.push(['unit-tests', null, []]);
  } else if (mode === 'changed') {
    const base = process.env.GITHUB_BASE_REF || 'main';
    steps.push(['affected', NPX, ['--no-install', 'turbo', 'run', 'lint', 'type-check', 'build', '--filter', `...[origin/${base}]`, '--no-color']]);
  } else if (mode === 'full') {
    steps.push(['lint', NPM, ['run', 'lint']]);
    steps.push(['type-check', NPM, ['run', 'type-check']]);
    steps.push(['unit-tests', null, []]);
    steps.push(['build', NPM, ['run', 'build']]);
  } else if (mode === 'unit') return (await runUnit()) ? 0 : 1;
  else if (mode !== 'doctor') throw new Error(`Unknown CI mode: ${mode}`);
  return execute(mode, steps);
}

const mode = process.argv[2] || 'check';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runMode(mode).then((code) => { process.exitCode = code; }).catch((error) => {
    console.error(`CI_ERROR ${error.message}`);
    process.exitCode = 1;
  });
}
