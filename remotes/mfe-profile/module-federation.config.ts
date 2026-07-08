import fs from 'node:fs';
import path from 'node:path';
import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

// Quy ước bank: exposes SINH TỰ ĐỘNG từ src/components/export.remote.ts —
// mỗi dòng `import X from "./path"` thành expose "./X" → "./src/components/path".
// (Hàm này lặp lại ở mỗi remote vì mỗi remote mô phỏng một repo độc lập.)
function generateExposes(): Record<string, string> {
  const filePath = path.resolve(__dirname, './src/components/export.remote.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  const exposes: Record<string, string> = {};
  const importRegex = /^import\s+(\w+)\s+from\s+["'](.+)["']/gm;
  let match = importRegex.exec(content);
  while (match !== null) {
    const [, componentName, importPath] = match;
    exposes[`./${componentName}`] = `./src/components/${importPath.replace(/^\.\//, '')}`;
    match = importRegex.exec(content);
  }
  return exposes;
}

// URL tuyệt đối cho chunks của remote — bake lúc build (bank pattern):
// thiếu nó, browser resolve remoteEntry.js tương đối theo origin của SHELL → 404.
const publicPath = process.env.PUBLIC_URL || 'http://localhost:3005/';

export default createModuleFederationConfig({
  name: 'mfe_profile',
  dts: false,
  manifest: { filePath: 'static' },
  filename: 'static/remoteEntry.js',
  getPublicPath: `function() { return ${JSON.stringify(publicPath)}; }`,
  exposes: generateExposes(),
  shared: {
    'react/jsx-runtime': { singleton: true, requiredVersion: false },
    'react/jsx-dev-runtime': { singleton: true, requiredVersion: false },
    '@app/common/ui': { singleton: true, requiredVersion: false },
    '@app/common/stores': { singleton: true, requiredVersion: false },
    react: { singleton: true, requiredVersion: '>=18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '>=18.2.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
  },
});
