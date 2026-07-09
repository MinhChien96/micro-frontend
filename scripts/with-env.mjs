#!/usr/bin/env node
// Chạy một lệnh với env của MÔI TRƯỜNG chỉ định (thay dotenvx của bank):
//   node scripts/with-env.mjs sit pnpm --filter ./remotes/mfe-accounts build
//   node scripts/with-env.mjs uat pnpm -r build
// Nạp .env.<env> (flatten mọi section) vào process env của lệnh con.
// Biến đã có sẵn trong shell cha KHÔNG bị ghi đè (ưu tiên override thủ công).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnvFlat } from './lib/env-file.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [envName, ...cmd] = process.argv.slice(2);

const envFile = path.join(root, `.env.${envName || ''}`);
if (!envName || !fs.existsSync(envFile)) {
  console.error(`Cách dùng: node scripts/with-env.mjs <sit|uat|staging|...> <lệnh...>`);
  console.error(`(cần file .env.<env> ở root — không thấy ${envFile})`);
  process.exit(1);
}
if (cmd.length === 0) {
  console.error('Thiếu lệnh cần chạy.');
  process.exit(1);
}

const fileEnv = parseEnvFlat(envFile);
console.log(`[with-env] ${envName} — nạp ${Object.keys(fileEnv).length} biến từ .env.${envName}`);

const result = spawnSync(cmd[0], cmd.slice(1), {
  cwd: root,
  stdio: 'inherit',
  env: { ...fileEnv, ...process.env }, // process.env thắng — cho phép override tay
});
process.exit(result.status ?? 0);
