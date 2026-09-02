import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GIT, NPM, ROOT, runCommand, writeJson } from './exec.mjs';
import { validateNames } from './env-contract.mjs';

const REQUIRED_FILES = [
  '.node-version',
  '.env.example',
  'package.json',
  'package-lock.json',
  'turbo.json',
  'vercel.json',
  'supabase/config.toml',
  '.github/workflows/ci.yml',
  '.github/workflows/preview.yml',
  '.github/workflows/deploy.yml',
];

function major(version) {
  const match = String(version).match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

function findTrackedMergeMarkers(files) {
  const matches = [];
  for (const filePath of files) {
    const absolute = path.join(ROOT, filePath);
    if (!fs.existsSync(absolute) || fs.statSync(absolute).size > 2_000_000) continue;
    const buffer = fs.readFileSync(absolute);
    if (buffer.includes(0)) continue;
    buffer.toString('utf8').split(/\r?\n/).forEach((line, index) => {
      if (/^(<<<<<<<|=======|>>>>>>>)\s?/.test(line)) matches.push(`${filePath}:${index + 1}`);
    });
  }
  return matches;
}

async function main() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const lockJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));
  const nodeVersionFile = fs.readFileSync(path.join(ROOT, '.node-version'), 'utf8').trim();
  const status = await runCommand('doctor-git-status', GIT, ['status', '--porcelain=v1']);
  const branch = await runCommand('doctor-git-branch', GIT, ['branch', '--show-current']);
  const diffCheck = await runCommand('doctor-diff-check', GIT, ['diff', '--check']);
  const npmVersion = await runCommand('doctor-npm-version', NPM, ['--version']);
  const dirty = Boolean(status.stdout.trim());
  const gitBranchName = branch.stdout.trim();
  // GitHub Actions checks out a pull request at a detached commit by default.
  // Use the event ref as evidence in CI while still rejecting a detached local
  // checkout where the operator may accidentally publish from the wrong state.
  const branchName = gitBranchName || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || (process.env.CI ? `ci-detached:${String(process.env.GITHUB_SHA || '').slice(0, 12)}` : '');
  const npmVersionText = npmVersion.stdout.trim();
  const nodeMajor = major(process.versions.node);
  const npmMajor = major(npmVersionText);
  const strictVersions = process.env.CI === 'true' || process.env.CI === '1' ? process.env.CI_DOCTOR_STRICT_VERSIONS !== '0' : false;
  const warnings = [];
  const errors = [];

  if (dirty && process.env.CI_DOCTOR_ALLOW_DIRTY !== '1') {
    if (process.env.CI === 'true' || process.env.CI === '1') errors.push('working tree is not clean');
    else warnings.push('working tree is not clean (allowed outside CI)');
  }
  if (!branchName) errors.push('repository is in detached HEAD state');
  if (diffCheck.code !== 0) errors.push('git diff --check failed');
  if (packageJson.packageManager !== 'npm@10.0.0') errors.push('packageManager must be npm@10.0.0');
  if (lockJson.lockfileVersion !== 3) errors.push('package-lock.json must use lockfileVersion 3');
  if (nodeVersionFile !== '24') errors.push('.node-version must pin 24');
  if (strictVersions && nodeMajor !== 24) errors.push(`Node major ${nodeMajor ?? 'unknown'} does not match 24`);
  if (strictVersions && npmMajor !== 10) errors.push(`npm major ${npmMajor ?? 'unknown'} does not match 10`);
  if (!strictVersions && nodeMajor !== 24) warnings.push(`local Node major ${nodeMajor ?? 'unknown'} differs from pinned 24`);
  if (!strictVersions && npmMajor !== 10) warnings.push(`local npm major ${npmMajor ?? 'unknown'} differs from pinned 10`);

  for (const file of REQUIRED_FILES) if (!fs.existsSync(path.join(ROOT, file))) errors.push(`missing required file ${file}`);

  const tracked = await runCommand('doctor-tracked-files', GIT, ['ls-files']);
  const trackedList = tracked.stdout.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const trackedEnv = trackedList.filter((file) => /(^|\/)\.env(?:\.|$)/.test(file) && file !== '.env.example' && !/\.env\.[^.]+\.example$/.test(file));
  if (trackedEnv.length) errors.push(`tracked environment files: ${trackedEnv.join(', ')}`);
  const mergeMarkers = findTrackedMergeMarkers(trackedList);
  if (mergeMarkers.length) errors.push(`merge markers found: ${mergeMarkers.join(', ')}`);

  const envNames = validateNames();
  if (envNames.status !== 'ok') errors.push('environment name contract failed');
  const result = { status: errors.length ? 'fail' : warnings.length ? 'warn' : 'ok', branch: branchName || null, dirty, nodeMajor, npmMajor, strictVersions, warnings, errors };
  writeJson('doctor-summary.json', result);
  for (const warning of warnings) console.warn(`DOCTOR_WARN ${warning}`);
  for (const error of errors) console.error(`DOCTOR_ERROR ${error}`);
  console.log(`DOCTOR_SUMMARY branch=${branchName || 'detached'} dirty=${dirty} node_major=${nodeMajor ?? 'unknown'} npm_major=${npmMajor ?? 'unknown'} status=${result.status}`);
  process.exitCode = result.status === 'fail' ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`DOCTOR_ERROR ${error.message}`);
    process.exitCode = 1;
  });
}
