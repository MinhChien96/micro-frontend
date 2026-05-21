/**
 * Shared webpack optimization config cho tất cả MFEs.
 *
 * Chiến lược cache:
 *   remoteEntry.js      → KHÔNG có hash (shell cần URL cố định)
 *                          → Serve với Cache-Control: max-age=0, must-revalidate
 *   vendors.[hash].js   → CÓ hash, nội dung thay đổi rất ít
 *                          → Serve với Cache-Control: max-age=31536000, immutable
 *   [name].[hash].js    → CÓ hash, app code thay đổi thường xuyên
 *                          → Serve với Cache-Control: max-age=31536000, immutable
 */

module.exports = {
  output: {
    // [contenthash:8] — hash 8 ký tự dựa trên NỘI DUNG file
    // Chỉ thay đổi khi file thực sự thay đổi → browser cache an toàn
    filename: '[name].[contenthash:8].js',

    // Async chunks (từ dynamic import bên trong MFE)
    chunkFilename: '[name].[contenthash:8].chunk.js',
  },

  optimization: {
    splitChunks: {
      chunks: 'all',       // Split cả initial và async chunks
      minSize: 20_000,     // Chunk nhỏ hơn 20KB thì không split

      cacheGroups: {
        // Vendor chunk: tất cả code từ node_modules
        // Thay đổi rất ít → browser cache lâu dài
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'initial',   // Chỉ initial — tránh conflict với async MFE chunks
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,       // Bỏ qua minSize/minChunks cho group này
        },

        // Async vendor chunks — khi MFE dùng dynamic import một thư viện nặng
        // Mỗi thư viện được tách thành 1 chunk riêng để cache granular hơn
        asyncVendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // pnpm context: /node_modules/.pnpm/lodash@4.17/node_modules/lodash
            // Tìm node_modules CUỐI CÙNG trong path để bỏ qua .pnpm virtual store
            const ctx = module.context || '';
            const idx = ctx.lastIndexOf('node_modules');
            if (idx === -1) return 'async-vendor';
            const after = ctx.slice(idx + 'node_modules/'.length);
            const match = after.match(/^((?:@[^/\\]+[/\\])?[^/\\]+)/);
            const pkg = match
              ? match[1].replace('@', '').replace(/[/\\]/, '-')
              : 'vendor';
            return `async-vendor.${pkg}`;
          },
          chunks: 'async',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
