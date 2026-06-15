/**
 * Generator tạo MFE remote mới (Modern.js SSR) + tự đăng ký vào shell.
 *   pnpm gen:mfe
 * Hỏi: tên (kebab), port, nhãn Nav. Sinh package đầy đủ + wire 8 điểm.
 * Các điểm nối dùng anchor comment `// @plop:*` trong file đăng ký.
 */
export default function (plop) {
  plop.setGenerator('mfe', {
    description: 'Tạo MFE remote mới + tự đăng ký vào shell/workspace/docker/CI',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Tên MFE (kebab, vd: payments):',
        validate: (v) => (/^[a-z][a-z0-9-]*$/.test(v) ? true : 'kebab-case, bắt đầu bằng chữ'),
      },
      {
        type: 'input',
        name: 'port',
        message: 'Port dev (vd: 3008):',
        validate: (v) => (/^\d{4}$/.test(v) ? true : 'cần 4 chữ số'),
      },
      { type: 'input', name: 'label', message: 'Nhãn hiển thị trên Nav (vd: Thanh toán):' },
    ],
    actions() {
      const route = 'shell/src/routes/{{kebabCase name}}/$.tsx';
      return [
        // 1) Sinh package MFE
        {
          type: 'addMany',
          destination: 'mfe-{{kebabCase name}}/',
          base: 'plop-templates/mfe/',
          templateFiles: 'plop-templates/mfe/**/*.hbs',
          stripExtensions: ['hbs'],
        },
        // 2) Tạo route trong shell
        { type: 'add', path: route, templateFile: 'plop-templates/shell-route.tsx.hbs' },
        // 3) pnpm-workspace.yaml
        {
          type: 'modify',
          path: 'pnpm-workspace.yaml',
          pattern: /(\n {2}# @plop:workspace)/,
          template: "\n  - 'mfe-{{kebabCase name}}'$1",
        },
        // 4) shell remotes
        {
          type: 'modify',
          path: 'shell/module-federation.config.ts',
          pattern: /(\n {4}\/\/ @plop:remote)/,
          template:
            "\n    mfe_{{snakeCase name}}: `mfe_{{snakeCase name}}@${m('mfe-{{kebabCase name}}', {{port}})}`,$1",
        },
        // 5) remotePages export
        {
          type: 'modify',
          path: 'shell/src/components/remotePages.tsx',
          pattern: /(\n\/\/ @plop:remote-page)/,
          template:
            '\nexport const {{pascalCase name}}App = protectedPage(\n  \'mfe_{{snakeCase name}}/{{pascalCase name}}App\',\n  () => import(\'mfe_{{snakeCase name}}/{{pascalCase name}}App\'),\n  <div className="loading-box"><div className="spinner" /><p>Đang tải {{label}}...</p></div>,\n);$1',
        },
        // 5b) khai báo module remote cho TS (shell)
        {
          type: 'modify',
          path: 'shell/mfe-declarations.d.ts',
          pattern: /(\n\/\/ @plop:declaration)/,
          template:
            "\ndeclare module 'mfe_{{snakeCase name}}/{{pascalCase name}}App' {\n  const {{pascalCase name}}App: React.ComponentType<any>;\n  export default {{pascalCase name}}App;\n}$1",
        },
        // 6) Nav link
        {
          type: 'modify',
          path: 'shell/src/components/Nav.tsx',
          pattern: /(\n {2}\/\/ @plop:nav-link)/,
          template:
            "\n  {\n    to: '/{{kebabCase name}}',\n    label: '{{label}}',\n    tag: 'mfe-{{kebabCase name}}',\n    prefetch: () => import('mfe_{{snakeCase name}}/{{pascalCase name}}App'),\n  },$1",
        },
        // 7) root start (concurrently) — chèn trước shell
        {
          type: 'modify',
          path: 'package.json',
          pattern: /(\\"pnpm --filter \.\/shell start\\")/,
          template: '\\"pnpm --filter ./mfe-{{kebabCase name}} start\\" $1',
        },
        {
          type: 'modify',
          path: 'package.json',
          pattern: /(-n shared,auth,accounts,transfer,cards,loans,profile)(,shell)/,
          template: '$1,{{kebabCase name}}$2',
        },
        {
          type: 'modify',
          path: 'package.json',
          pattern: /(-c yellow,blue,green,cyan,purple,orange,pink)(,red)/,
          template: '$1,gray$2',
        },
        // 8) docker-compose service
        {
          type: 'modify',
          path: 'docker/docker-compose.yml',
          pattern: /(\n {2}# @plop:service)/,
          template:
            '\n  mfe-{{kebabCase name}}:\n    <<: *remote-defaults\n    build:\n      context: ..\n      dockerfile: docker/Dockerfile\n      args: { APP: mfe-{{kebabCase name}}, PUBLIC_URL: "http://localhost:{{port}}/" }\n    environment: { PORT: {{port}}, MODERN_MF_AUTO_CORS: "true" }\n    ports: ["{{port}}:{{port}}"]\n$1',
        },
        // 9) deploy-aws app lists
        {
          type: 'modify',
          path: '.github/workflows/deploy-aws.yml',
          pattern: /(for app in )/,
          template: '$1mfe-{{kebabCase name}} ',
        },
        {
          type: 'modify',
          path: '.github/workflows/deploy-aws.yml',
          pattern: /(app: \[shell, )/,
          template: '$1mfe-{{kebabCase name}}, ',
        },
        // Checklist
        () =>
          [
            '',
            '✅ Đã tạo mfe-{{kebabCase name}} + wire shell/workspace/docker/CI.',
            '👉 Bước tiếp: pnpm install && pnpm biome check --write .',
            '⚠️ docker-compose.yml shell service: tự thêm 2 dòng (xem docs/add-new-mfe.md):',
            '   - MF_INTERNAL_HOST_MAP: "http://localhost:{{port}}":"http://mfe-{{kebabCase name}}:{{port}}"',
            '   - depends_on: - mfe-{{kebabCase name}}',
          ].join('\n'),
      ];
    },
  });
}
