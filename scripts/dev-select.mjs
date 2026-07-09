#!/usr/bin/env node
// Menu chọn remote khi dev (bank: dev-local-select.mjs):
//   pnpm dev            → hỏi chọn remote (Enter = tất cả)
//   pnpm dev 1 3        → chạy shell + remote số 1 và 3
// KHÔNG cần bật đủ remote — màn thiếu remote hiện RemoteUnavailable
// (error-handling-plugin), app không crash.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

console.log('Chọn remote chạy kèm shell (Enter = tất cả):');
candidates.forEach((name, i) => {
  console.log(`  ${i + 1}. ${name}`);
});

// ---- Chọn qua argv hoặc prompt ----------------------------------------------
async function pickIndexes() {
  const argNums = process.argv.slice(2).filter((a) => /^\d+$/.test(a));
  if (argNums.length) return argNums.map(Number);
  if (!process.stdin.isTTY) return []; // non-TTY (CI) → tất cả

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => rl.question('Nhập số (vd "1 3"): ', resolve));
  rl.close();
  return answer.trim().split(/\s+/).filter(Boolean).map(Number);
}

const indexes = await pickIndexes();
const selected =
  indexes.length === 0 ? candidates : indexes.map((n) => candidates[n - 1]).filter(Boolean);

console.log(`\n→ Chạy: shell + ${selected.join(', ')}\n`);

// ---- sync env + chạy song song ----------------------------------------------
spawnSync('node', [path.join(root, 'scripts', 'sync-env.mjs')], { stdio: 'inherit' });

const filters = ['--filter', './shell', ...selected.flatMap((d) => ['--filter', `./remotes/${d}`])];
const result = spawnSync('pnpm', [...filters, '--parallel', 'start'], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(result.status ?? 0);
