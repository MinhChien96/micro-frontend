/**
 * Centralized remote URL registry.
 *
 * Mỗi team quản lý MFE của mình và deploy lên domain riêng.
 * Shell (và các MFE khác) chỉ cần biết URL của remoteEntry.js.
 *
 * Trong CI/CD của từng team, họ set env var để trỏ đến deployment của mình:
 *
 *   MFE_AUTH_URL=https://auth.company.com/remoteEntry.js
 *   MFE_PRODUCTS_URL=https://products.company.com/remoteEntry.js
 *
 * Team khác build hoàn toàn độc lập — shell không cần rebuild lại.
 * Shell chỉ cần biết URL, còn code bên trong là trách nhiệm của từng team.
 */

// Khi CI/CD build cho GitHub Pages, set BASE_GH_PAGES để auto-derive tất cả URLs
// Ví dụ: BASE_GH_PAGES=https://minhchien96.github.io/micro-frontend
const base = process.env.BASE_GH_PAGES;

const URLS = {
  shared:       process.env.SHARED_URL        || (base ? `${base}/shared/remoteEntry.js`       : 'http://localhost:3004/remoteEntry.js'),
  mfe_auth:     process.env.MFE_AUTH_URL      || (base ? `${base}/mfe-auth/remoteEntry.js`     : 'http://localhost:3001/remoteEntry.js'),
  mfe_products: process.env.MFE_PRODUCTS_URL  || (base ? `${base}/mfe-products/remoteEntry.js` : 'http://localhost:3002/remoteEntry.js'),
  mfe_cart:     process.env.MFE_CART_URL      || (base ? `${base}/mfe-cart/remoteEntry.js`     : 'http://localhost:3003/remoteEntry.js'),
}

// Format theo chuẩn Module Federation: "name@url"
module.exports = {
  shared:       `shared@${URLS.shared}`,
  mfe_auth:     `mfe_auth@${URLS.mfe_auth}`,
  mfe_products: `mfe_products@${URLS.mfe_products}`,
  mfe_cart:     `mfe_cart@${URLS.mfe_cart}`,
}
