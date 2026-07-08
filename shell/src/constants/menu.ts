import { Paths } from '@app/common/constants/paths';

// Menu điều hướng khai báo TĨNH (bank: shell/constants/routes.ts) —
// Nav render từ đây; thêm màn hình mới = thêm 1 NavItem.
// `permissions` sẽ nối với hệ P/S/F (canAction) — item không đủ quyền bị ẩn.
export interface NavItem {
  to: string;
  /** key i18n trong shell resources (bank: titleKey) */
  labelKey: string;
  /** tag hiển thị tên MFE sở hữu màn hình (giá trị giáo dục của template) */
  tag: string;
  /** remote + expose để prefetch khi hover */
  prefetch?: { remote: string; expose: string };
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: Paths.accounts,
    labelKey: 'nav.accounts',
    tag: 'mfe-accounts',
    prefetch: { remote: 'mfe_accounts', expose: 'AccountsApp' },
  },
  {
    to: Paths.transfer,
    labelKey: 'nav.transfer',
    tag: 'mfe-transfer',
    prefetch: { remote: 'mfe_transfer', expose: 'TransferApp' },
  },
  {
    to: Paths.cards,
    labelKey: 'nav.cards',
    tag: 'mfe-cards',
    prefetch: { remote: 'mfe_cards', expose: 'CardsApp' },
  },
  {
    to: Paths.loans,
    labelKey: 'nav.loans',
    tag: 'mfe-loans',
    prefetch: { remote: 'mfe_loans', expose: 'LoansApp' },
  },
  // @plop:nav-link (generator chèn NavItem MFE mới bên trên)
];
