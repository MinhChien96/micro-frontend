// Parser dùng chung cho file env chia SECTION (bank format):
//   # <module>
//   KEY=VALUE
//   # end <module>
// Dùng bởi sync-env.mjs (per section) + dev-select.mjs / with-env.mjs (flatten).
import fs from 'node:fs';

const SECTION_START = /^#\s*([\w-]+)\s*$/;
const SECTION_END = /^#\s*end\s+([\w-]+)\s*$/;

/** Map<module, lines[]> — giữ nguyên dòng (kể cả comment trong section) */
export function parseSections(filePath) {
  const sections = new Map();
  let current = null;
  for (const line of fs.readFileSync(filePath, 'utf-8').split('\n')) {
    if (SECTION_END.test(line)) {
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
  return sections;
}

/** Flatten mọi KEY=VALUE trong file (bỏ comment) → object cho spawn env */
export function parseEnvFlat(filePath) {
  const env = {};
  for (const raw of fs.readFileSync(filePath, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue;
    env[key] = line
      .slice(eq + 1)
      .trim()
      .replace(/^(["'])(.*)\1$/, '$2'); // bỏ quote bao ngoài nếu có
  }
  return env;
}

export const keyOfLine = (line) => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=/);
  return m ? m[1] : null;
};
