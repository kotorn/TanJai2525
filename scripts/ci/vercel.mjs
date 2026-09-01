import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { GIT, NPM, NPX, ROOT, requireEnv, runCommand, writeJson } from './exec.mjs';

const SCHEMA_BY_ENV = { local: 'public', preview: 'public', staging: 'public', production: 'public' };

function cliArgs(args) { return ['--no-install', 'vercel', ...args]; }
function deploymentBranch() { return process.env.VERCEL_GIT_BRANCH || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || 'preview'; }
function commitSha() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try { return execFileSync(GIT, ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return 'local'; }
}
function environmentConfig() {
  const appEnv = String(process.env.APP_ENV || 'preview').trim();
  const schema = String(process.env.SUPABASE_SCHEMA || '').trim() || SCHEMA_BY_ENV[appEnv];
  if (!SCHEMA_BY_ENV[appEnv]) throw new Error('APP_ENV must be local, preview, staging, or production');
  if (schema !== SCHEMA_BY_ENV[appEnv]) throw new Error('SUPABASE_SCHEMA does not match APP_ENV');
  return { appEnv, schema, branch: deploymentBranch(), sha: commitSha() };
}
function writeGithubOutput(values) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${Object.entries(values).map(([name, value]) => `${name}=${value}`).join('\n')}\n`, 'utf8');
}
function parseDeploymentUrl(stdout) {
  const candidates = [...String(stdout).matchAll(/https:\/\/[^\s'"<>]+/g)].map((match) => match[0].replace(/[),.;]+$/, '')).filter((url) => !url.includes('vercel.com/docs'));
  return candidates.reverse().find((url) => url.includes('vercel.app')) || candidates.at(-1) || null;
}
async function link() {
  requireEnv(['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'], 'vercel');
  return runCommand('vercel-link', NPX, cliArgs(['link', '--yes', '--project', process.env.VERCEL_PROJECT_ID, '--scope', process.env.VERCEL_ORG_ID, '--token', process.env.VERCEL_TOKEN]));
}
async function deployPreview() {
  const config = environmentConfig();
  const linked = await link();
  if (linked.code !== 0) return linked.code;
  const pullEnvironment = process.env.VERCEL_PULL_ENV || (config.appEnv === 'production' ? 'production' : 'preview');
  const pulled = await runCommand('vercel-pull', NPX, cliArgs(['pull', '--yes', '--environment', pullEnvironment, '--git-branch', config.branch, '--token', process.env.VERCEL_TOKEN]));
  if (pulled.code !== 0) return pulled.code;
  const envCheck = await runCommand('vercel-env-check', NPM, ['run', 'env:check'], { env: { APP_ENV: config.appEnv, SUPABASE_SCHEMA: config.schema, NEXT_PUBLIC_SUPABASE_SCHEMA: config.schema } });
  if (envCheck.code !== 0) return envCheck.code;
  const built = await runCommand('vercel-build', NPX, cliArgs(['build', '--token', process.env.VERCEL_TOKEN, '--build-env', `APP_ENV=${config.appEnv}`, '--build-env', `SUPABASE_SCHEMA=${config.schema}`, '--build-env', `NEXT_PUBLIC_SUPABASE_SCHEMA=${config.schema}`]));
  if (built.code !== 0) return built.code;
  const deployed = await runCommand('vercel-deploy-prebuilt', NPX, cliArgs(['deploy', '--prebuilt', '--token', process.env.VERCEL_TOKEN, '--meta', `githubCommitSha=${config.sha}`, '--meta', `githubCommitRef=${config.branch}`]));
  if (deployed.code !== 0) return deployed.code;
  const url = parseDeploymentUrl(deployed.stdout);
  if (!url) throw new Error('Vercel deploy completed without a deployment URL');
  const summary = { status: 'ok', appEnv: config.appEnv, schema: config.schema, commitSha: config.sha, deploymentUrl: url };
  writeJson('vercel-summary.json', summary);
  writeGithubOutput({ deployment_url: url, commit_sha: config.sha, status: 'ok' });
  console.log(`VERCEL_SUMMARY status=ok app_env=${config.appEnv} commit_sha=${config.sha} deployment_url=${url}`);
  return 0;
}
async function promote() {
  const config = environmentConfig();
  if (config.appEnv !== 'production') throw new Error('vercel promote requires APP_ENV=production');
  requireEnv(['VERCEL_DEPLOYMENT_URL'], 'vercel promote');
  const linked = await link();
  if (linked.code !== 0) return linked.code;
  const promoted = await runCommand('vercel-promote', NPX, cliArgs(['promote', process.env.VERCEL_DEPLOYMENT_URL, '--scope', process.env.VERCEL_ORG_ID, '--token', process.env.VERCEL_TOKEN]));
  const summary = { status: promoted.code === 0 ? 'ok' : 'fail', commitSha: config.sha, deploymentUrl: process.env.VERCEL_DEPLOYMENT_URL };
  writeJson('vercel-promote-summary.json', summary);
  console.log(`VERCEL_PROMOTE status=${summary.status} commit_sha=${config.sha} deployment_url=${summary.deploymentUrl}`);
  return promoted.code;
}
async function main() {
  const mode = process.argv[2] || 'preview';
  requireEnv(['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'], `vercel ${mode}`);
  if (mode === 'preview') process.exitCode = await deployPreview();
  else if (mode === 'promote') process.exitCode = await promote();
  else throw new Error(`Unknown Vercel mode: ${mode}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`VERCEL_ERROR ${error.message}`); process.exitCode = 1; });
}
