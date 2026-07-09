/**
 * Generator tạo MFE remote mới (CSR + runtime MF) + tự đăng ký vào shell.
 *   pnpm gen:mfe
 * Hỏi: tên (kebab), port, nhãn Nav. Sinh package trong remotes/ + wire 7 điểm
 * (workspace glob remotes/* tự nhận package — không cần sửa pnpm-workspace).
 * Các điểm nối dùng anchor comment `// @plop:*` trong file đăng ký.
 */
export default function (plop) {
  plop.setGenerator('mfe', {
    description: 'Tạo MFE remote mới + tự đăng ký shell/env/docker/CI',
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
      return [
        // 1) Sinh package MFE trong remotes/ (workspace glob tự nhận)
        {
          type: 'addMany',
          destination: 'remotes/mfe-{{kebabCase name}}/',
          base: 'plop-templates/mfe/',
          templateFiles: 'plop-templates/mfe/**/*.hbs',
          stripExtensions: ['hbs'],
        },
        // 2) Route splat trong shell (__private — guard/Nav từ PrivateLayout)
        {
          type: 'add',
          path: 'shell/src/routes/__private/{{kebabCase name}}/$.tsx',
          templateFile: 'plop-templates/shell-route.tsx.hbs',
        },
        // 3) remote-urls.ts — nguồn sự thật manifest URL (dev remotes + runtime)
        {
          type: 'modify',
          path: 'shell/remote-urls.ts',
          pattern: /(\n {2}\/\/ @plop:remote-port)/,
          template: '\n  mfe_{{snakeCase name}}: {{port}},$1',
        },
        // 4) remotePages — lazyRemoteWithFallback + Suspense skeleton
        {
          type: 'modify',
          path: 'shell/src/components/remotePages.tsx',
          pattern: /(\n\/\/ @plop:remote-page)/,
          template:
            '\nexport const {{pascalCase name}}App = remotePage(\n  \'mfe_{{snakeCase name}}\',\n  \'{{pascalCase name}}App\',\n  <div className="loading-box">\n    <div className="spinner" />\n    <p>Đang tải {{label}}...</p>\n  </div>,\n);$1',
        },
        // 5) Nav item (label literal — chuyển sang labelKey khi thêm i18n key)
        {
          type: 'modify',
          path: 'shell/src/constants/menu.ts',
          pattern: /(\n {2}\/\/ @plop:nav-link)/,
          template:
            "\n  {\n    to: '/{{kebabCase name}}',\n    label: '{{label}}',\n    tag: 'mfe-{{kebabCase name}}',\n    prefetch: { remote: 'mfe_{{snakeCase name}}', expose: '{{pascalCase name}}App' },\n  },$1",
        },
        // 6) root start script (concurrently) — chèn trước shell
        {
          type: 'modify',
          path: 'package.json',
          pattern: /(\\"pnpm --filter \.\/shell start\\")/,
          template: '\\"pnpm --filter ./remotes/mfe-{{kebabCase name}} start\\" $1',
        },
        {
          type: 'modify',
          path: 'package.json',
          pattern: /(-n common,auth,accounts,transfer,cards,loans,profile)(,shell)/,
          template: '$1,{{kebabCase name}}$2',
        },
        {
          type: 'modify',
          path: 'package.json',
          pattern: /(-c yellow,blue,green,cyan,purple,orange,pink)(,red)/,
          template: '$1,gray$2',
        },
        // 7) docker-compose service (nginx static)
        {
          type: 'modify',
          path: 'docker/docker-compose.yml',
          pattern: /(\n {2}# @plop:service)/,
          template:
            '\n  mfe-{{kebabCase name}}:\n    <<: *app-defaults\n    build:\n      context: ..\n      dockerfile: docker/Dockerfile\n      args: { APP: remotes/mfe-{{kebabCase name}}, PUBLIC_URL: "http://localhost:{{port}}/" }\n    ports: ["{{port}}:8080"]\n$1',
        },
        // 8) deploy-aws list app mặc định
        {
          type: 'modify',
          path: '.github/workflows/deploy-aws.yml',
          pattern: /(DEFAULT=")/,
          template: '$1remotes/mfe-{{kebabCase name}} ',
        },
        // Checklist
        () =>
          [
            '',
            '✅ Đã tạo remotes/mfe-{{kebabCase name}} + wire shell/docker/CI.',
            '👉 Bước tiếp:',
            '   1. pnpm install',
            '   2. pnpm lint:fix',
            '   3. pnpm dev  (chọn mfe-{{kebabCase name}})',
            '📋 Tùy chọn:',
            '   - Thêm section env vào .env.example (# mfe-{{kebabCase name}} ... # end)',
            '   - Thêm entry vào remotes.json (registry)',
            '   - docker-compose: thêm mfe-{{kebabCase name}} vào depends_on của shell',
            '   - i18n: đổi label → labelKey + thêm key vào shell/src/i18n/resources.ts',
          ].join('\n'),
      ];
    },
  });
}
