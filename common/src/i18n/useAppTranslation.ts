import type { Resource } from 'i18next';
import { useEffect, useMemo } from 'react';
import { type UseTranslationResponse, useTranslation } from 'react-i18next';
import type { Lang } from '../stores/global.store';
import { setLang as setStoreLang, useGlobalStore } from '../stores/global.store';
import { i18nService } from './i18nService';

/**
 * Hook i18n cho một module (bank: useMWTranslation):
 *   const { t } = useAppTranslation('accounts', { vi: {...}, en: {...} });
 * - instance riêng theo tên module, resources bundle trong module
 * - tự đồng bộ với store.lang (đổi ngôn ngữ ở bất kỳ đâu là mọi nơi đổi theo)
 */
export function useAppTranslation(
  instanceName: string,
  resources: Resource,
): UseTranslationResponse<string, undefined> {
  const lang = useGlobalStore((s) => s.lang);

  // resources bundle tĩnh — chỉ tạo instance lần đầu theo tên
  // biome-ignore lint/correctness/useExhaustiveDependencies: resources tĩnh theo module
  const instance = useMemo(() => i18nService.getOrCreate(instanceName, resources), [instanceName]);

  useEffect(() => {
    if (instance.language !== lang) instance.changeLanguage(lang);
  }, [lang, instance]);

  return useTranslation(undefined, { i18n: instance });
}

/** Đổi ngôn ngữ toàn hệ thống: cập nhật store + mọi instance i18next */
export function changeAppLanguage(lang: Lang): void {
  setStoreLang(lang);
  i18nService.changeLanguage(lang);
}
