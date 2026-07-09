#!/usr/bin/env node
// Đồng bộ env theo SECTION (bank: sync-env.mjs):
//   node scripts/sync-env.mjs [envfile] [--force]
//   - mặc định envfile = .env.local (tự tạo từ .env.example nếu chưa có)
//   - .env.sit / .env.uat...: đẩy config môi trường đó xuống <module>/.env.local
//     (dùng khi muốn "ghim" một môi trường mà không qua dev-select/with-env)
// Section `# global` đẩy xuống MỌI module. Mặc định CHỈ THÊM key còn thiếu
// (không ghi đè giá trị bạn đã chỉnh); --force ghi đè toàn bộ theo nguồn.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { keyOfLine, parseSections } from './lib/env-file.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const force = args.includes('--force');
const sourceArg = args.find((a) => !a.startsWith('--'));

let sourcePath;
if (sourceArg) {
  sourcePath = path.resolve(root, sourceArg);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Không thấy file nguồn: ${sourcePath}`);
    process.exit(1);
  }
} else {
  sourcePath = path.join(root, '.env.local');
  if (!fs.existsSync(sourcePath)) {
    fs.copyFileSync(path.join(root, '.env.example'), sourcePath);
    console.log('Đã tạo .env.local từ .env.example');
  }
}

const sections = parseSections(sourcePath);

const targetOf = (module) =>
  module === 'shell'
    ? path.join(root, 'shell', '.env.local')
    : path.join(root, 'remotes', module, '.env.local');

for (const [module, lines] of sections) {
  if (module === 'global') continue; // đẩy kèm vào mọi module bên dưới
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
  const existingKeys = new Set(existing.split('\n').map(keyOfLine).filter(Boolean));
  const missing = wanted.filter((l) => {
    const k = keyOfLine(l);
    return k ? !existingKeys.has(k) : !existing.includes(l);
  });
  if (missing.length) {
    fs.writeFileSync(target, `${missing.join('\n')}\n${existing}`);
    console.log(`✔ ${module}: thêm ${missing.length} dòng thiếu`);
  }
}
console.log(`Đồng bộ env xong (nguồn: ${path.basename(sourcePath)}).`);
