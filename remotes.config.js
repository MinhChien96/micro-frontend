/**
 * Centralized remote URL registry — Banking Domain.
 *
 * Mỗi team quản lý MFE của mình và deploy lên domain riêng.
 * Shell (và các MFE khác) chỉ cần biết URL của remoteEntry.js.
 *
 * Trong CI/CD của từng team, họ set env var để trỏ đến deployment của mình:
 *
 *   MFE_ACCOUNTS_URL=https://accounts.bank.com/remoteEntry.js
 *
 * Team khác build hoàn toàn độc lập — shell không cần rebuild lại.
 */

// Khi CI/CD build cho GitHub Pages, set BASE_GH_PAGES để auto-derive tất cả URLs
// Ví dụ: BASE_GH_PAGES=https://minhchien96.github.io/micro-frontend
const base = process.env.BASE_GH_PAGES;

const URLS = {
  shared:       process.env.SHARED_URL         || (base ? `${base}/shared/remoteEntry.js`        : 'http://localhost:3004/remoteEntry.js'),
  mfe_auth:     process.env.MFE_AUTH_URL       || (base ? `${base}/mfe-auth/remoteEntry.js`      : 'http://localhost:3001/remoteEntry.js'),
  mfe_accounts: process.env.MFE_ACCOUNTS_URL   || (base ? `${base}/mfe-accounts/remoteEntry.js`  : 'http://localhost:3002/remoteEntry.js'),
  mfe_transfer: process.env.MFE_TRANSFER_URL   || (base ? `${base}/mfe-transfer/remoteEntry.js`  : 'http://localhost:3003/remoteEntry.js'),
  mfe_profile:  process.env.MFE_PROFILE_URL    || (base ? `${base}/mfe-profile/remoteEntry.js`   : 'http://localhost:3005/remoteEntry.js'),
  mfe_loans:    process.env.MFE_LOANS_URL      || (base ? `${base}/mfe-loans/remoteEntry.js`     : 'http://localhost:3006/remoteEntry.js'),
  mfe_cards:    process.env.MFE_CARDS_URL      || (base ? `${base}/mfe-cards/remoteEntry.js`     : 'http://localhost:3007/remoteEntry.js'),
}

// Format theo chuẩn Module Federation: "name@url"
module.exports = {
  shared:       `shared@${URLS.shared}`,
  mfe_auth:     `mfe_auth@${URLS.mfe_auth}`,
  mfe_accounts: `mfe_accounts@${URLS.mfe_accounts}`,
  mfe_transfer: `mfe_transfer@${URLS.mfe_transfer}`,
  mfe_profile:  `mfe_profile@${URLS.mfe_profile}`,
  mfe_loans:    `mfe_loans@${URLS.mfe_loans}`,
  mfe_cards:    `mfe_cards@${URLS.mfe_cards}`,
}
