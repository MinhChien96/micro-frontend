/**
 * Centralized remote URL registry — plain URLs cho @module-federation/vite.
 *
 * CI/CD của từng team set env var để trỏ đến deployment của mình:
 *   MFE_ACCOUNTS_URL=https://accounts.bank.com/remoteEntry.js
 *
 * BASE_GH_PAGES dùng cho GitHub Pages full deploy:
 *   BASE_GH_PAGES=https://minhchien96.github.io/micro-frontend
 */

const base  = process.env.BASE_GH_PAGES;
const local = (port) => `http://localhost:${port}/remoteEntry.js`;
const pages = (path) => `${base}/${path}/remoteEntry.js`;

module.exports = {
  mfe_auth:     process.env.MFE_AUTH_URL     || (base ? pages('mfe-auth')     : local(3001)),
  mfe_accounts: process.env.MFE_ACCOUNTS_URL || (base ? pages('mfe-accounts') : local(3002)),
  mfe_transfer: process.env.MFE_TRANSFER_URL || (base ? pages('mfe-transfer') : local(3003)),
  mfe_profile:  process.env.MFE_PROFILE_URL  || (base ? pages('mfe-profile')  : local(3005)),
  mfe_loans:    process.env.MFE_LOANS_URL    || (base ? pages('mfe-loans')    : local(3006)),
  mfe_cards:    process.env.MFE_CARDS_URL    || (base ? pages('mfe-cards')    : local(3007)),
};
