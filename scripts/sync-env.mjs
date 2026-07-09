#!/usr/bin/env node
// Đồng bộ env theo SECTION (bank: sync-env-local.mjs):
//   root .env.local chia section `# <module>` ... `# end <module>` →
//   đẩy xuống <module>/.env.local (shell/.env.local, remotes/<m>/.env.local).
// - Section `# global` đẩy xuống MỌI module.
// - Mặc định CHỈ THÊM key còn thiếu (không ghi đè giá trị bạn đã chỉnh).
// - `node scripts/sync-env.mjs --force` → ghi đè toàn bộ theo root.
// - Chưa có root .env.local → copy từ .env.example.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');

const rootEnvPath = path.join(root, '.env.local');
if (!fs.existsSync(rootEnvPath)) {
  fs.copyFileSync(path.join(root, '.env.example'), rootEnvPath);
  console.log('Đã tạo .env.local từ .env.example');
}

// ---- Parse sections -------------------------------------------------------
const SECTION_START = /^#\s*([\w-]+)\s*$/;
const SECTION_END = /^#\s*end\s+([\w-]+)\s*$/;

const sections = new Map(); // module → lines[]
let current = null;
for (const line of fs.readFileSync(rootEnvPath, 'utf-8').split('\n')) {
  const end = line.match(SECTION_END);
  if (end) {
    current = null;
    continue;
  }
  const start = line.match(SECTION_START);
  if (start && !current) {
    current = start[1];
    if (!sections.has(current)) sections.set(current, []);
    continue;
  }
  if (current) sections.get(current).push(line);
}

const targetOf = (module) =>
  module === 'shell'
    ? path.join(root, 'shell', '.env.local')
    : path.join(root, 'remotes', module, '.env.local');

const keyOf = (line) => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=/);
  return m ? m[1] : null;
};

for (const [module, lines] of sections) {
  if (module === 'global') continue; // xử lý sau — đẩy vào mọi module
  const target = targetOf(module);
  if (!fs.existsSync(path.dirname(target))) {
    console.warn(`⚠️  Bỏ qua section "${module}" — không thấy thư mục module`);
    continue;
  }
  const globalLines = sections.get('global') ?? [];
  const wanted = [...globalLines, ...lines].filter((l) => l.trim() !== '');

  if (force || !fs.existsSync(target)) {
    fs.writeFileSync(target, `${wanted.join('\n')}\n`);
    console.log(`✔ ${module}: ghi ${wanted.length} dòng (${force ? 'force' : 'mới'})`);
    continue;
  }

  const existing = fs.readFileSync(target, 'utf-8');
  const existingKeys = new Set(existing.split('\n').map(keyOf).filter(Boolean));
  const missing = wanted.filter((l) => {
    const k = keyOf(l);
    return k ? !existingKeys.has(k) : !existing.includes(l);
  });
  if (missing.length) {
    fs.writeFileSync(target, `${missing.join('\n')}\n${existing}`);
    console.log(`✔ ${module}: thêm ${missing.length} dòng thiếu`);
  }
}
console.log('Đồng bộ env xong.');
