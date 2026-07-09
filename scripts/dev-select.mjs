#!/usr/bin/env node
// Menu dev đa môi trường (bank: dev-select.mjs, có cải tiến mixed-mode tự động):
//   pnpm dev              → hỏi môi trường (local/sit/uat/staging) + chọn remote
//   pnpm dev sit          → env SIT, hỏi chọn remote
//   pnpm dev sit 1 3      → env SIT, chạy remote số 1 và 3 ở LOCAL
//
// MIXED MODE (env != local): remote ĐƯỢC CHỌN chạy dev ở local; các remote còn
// lại + API gateway trỏ server của môi trường đó (.env.<env>). Cơ chế: nạp
// .env.<env> vào process env của lệnh con, rồi XÓA REMOTE_HOST/PORT/BASE_PATH
// của remote được chọn → shell + chính remote đó fallback localhost.
// (Bank phải sửa tay section trong env file — template tự động hóa bước này.)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { parseEnvFlat } from './lib/env-file.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENVS = ['local', 'sit', 'uat', 'staging'];

// ---- Liệt kê remote candidates ---------------------------------------------
const remotesDir = path.join(root, 'remotes');
const candidates = fs
  .readdirSync(remotesDir)
  .filter((dir) => {
    const pkgPath = path.join(remotesDir, dir, 'package.json');
    if (!fs.existsSync(pkgPath)) return false;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return typeof pkg.scripts?.start === 'string';
  })
  .sort();

if (candidates.length === 0) {
  console.error('Không tìm thấy remote nào trong remotes/');
  process.exit(1);
}

const ask = async (question) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => rl.question(question, resolve));
  rl.close();
  return answer.trim();
};

// ---- Chọn môi trường (argv[2] hoặc prompt) -----------------------------------
async function pickEnv() {
  const arg = (process.argv[2] || '').toLowerCase();
  if (ENVS.includes(arg)) return arg;
  if (!process.stdin.isTTY) return 'local';
  const answer = await ask(`Môi trường [${ENVS.join('/')}] (mặc định: local): `);
  return ENVS.includes(answer.toLowerCase()) ? answer.toLowerCase() : 'local';
}

// ---- Chọn remote chạy LOCAL (argv số hoặc prompt) -----------------------------
async function pickIndexes(envName) {
  const argNums = process.argv.slice(2).filter((a) => /^\d+$/.test(a));
  if (argNums.length) return argNums.map(Number);
  if (!process.stdin.isTTY) return [];

  console.log(
    envName === 'local'
      ? 'Chọn remote chạy kèm shell (Enter = tất cả):'
      : `Chọn remote chạy LOCAL — các remote còn lại dùng server ${envName.toUpperCase()} (Enter = tất cả local):`,
  );
  candidates.forEach((name, i) => {
    console.log(`  ${i + 1}. ${name}`);
  });
  const answer = await ask('Nhập số (vd "1 3"): ');
  return answer.split(/\s+/).filter(Boolean).map(Number);
}

const envName = await pickEnv();
const indexes = await pickIndexes(envName);
const selected =
  indexes.length === 0 ? candidates : indexes.map((n) => candidates[n - 1]).filter(Boolean);

// ---- Build env cho lệnh con ---------------------------------------------------
let childEnv = { ...process.env };

if (envName !== 'local') {
  const envFile = path.join(root, `.env.${envName}`);
  if (!fs.existsSync(envFile)) {
    console.error(`Không thấy ${envFile}`);
    process.exit(1);
  }
  const fileEnv = parseEnvFlat(envFile);
  // Remote được chọn chạy LOCAL → xóa override của môi trường cho chính nó
  for (const dir of selected) {
    const key = dir.replace(/-/g, '_').toUpperCase(); // mfe-accounts → MFE_ACCOUNTS
    fileEnv[`REMOTE_HOST_${key}`] = '';
    fileEnv[`REMOTE_PORT_${key}`] = '';
    fileEnv[`REMOTE_BASE_PATH_${key}`] = '';
  }
  childEnv = { ...childEnv, ...fileEnv };
}

const remoteLabel =
  envName === 'local'
    ? selected.join(', ')
    : `${selected.join(', ')} (LOCAL) · còn lại + API → ${envName.toUpperCase()}`;
console.log(`\n→ Chạy: shell + ${remoteLabel}\n`);

// ---- sync env module-level (chỉ local) + chạy song song ----------------------
if (envName === 'local') {
  spawnSync('node', [path.join(root, 'scripts', 'sync-env.mjs')], { stdio: 'inherit' });
}

const filters = ['--filter', './shell', ...selected.flatMap((d) => ['--filter', `./remotes/${d}`])];
const result = spawnSync('pnpm', [...filters, '--parallel', 'start'], {
  cwd: root,
  stdio: 'inherit',
  env: childEnv,
});
process.exit(result.status ?? 0);
