import { createContext, useContext } from 'react';
import type { Link, NavigateFunction, Route, Routes, useParams } from 'react-router-dom';

// ============================================================================
// Pattern B (bank: card-zone): remote SỞ HỮU cả nhánh router /cards/*.
// Shell truyền NGUYÊN MODULE router qua props (spread {...MRouter}) để zone
// dùng đúng router instance/context của shell — không phụ thuộc chuyện
// react-router có được share singleton hay không.
// ============================================================================

/** Tập con router module mà zone này cần (shell truyền superset) */
export interface RouterModuleProps {
  Routes: typeof Routes;
  Route: typeof Route;
  Link: typeof Link;
  useNavigate: () => NavigateFunction;
  useParams: typeof useParams;
}

const CardsRouteContext = createContext<RouterModuleProps | null>(null);

export const CardsRouteProvider = CardsRouteContext.Provider;

/** Component con trong zone lấy router từ context — KHÔNG import react-router-dom */
export function useCardsRouter(): RouterModuleProps {
  const ctx = useContext(CardsRouteContext);
  if (!ctx) {
    throw new Error('useCardsRouter phải dùng bên trong <CardsRoutes> (CardsRouteProvider)');
  }
  return ctx;
}

// Cho code NGOÀI React tree (service, callback...) điều hướng được (bank:
// syncNavigateFunction) — CardsRoutes đồng bộ navigate của shell vào đây.
let navigateFn: NavigateFunction | null = null;

export function syncNavigateFunction(fn: NavigateFunction): void {
  navigateFn = fn;
}

export function zoneNavigate(to: string): void {
  navigateFn?.(to);
}
