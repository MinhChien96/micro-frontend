import i18next, { type i18n, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Lang } from '../stores/global.store';
import { globalStore } from '../stores/global.store';
import { getOrCreateSingleton } from '../utils/singleton';

// ============================================================================
// i18n ĐA INSTANCE (bank pattern): MỖI module/remote một instance i18next
// riêng với resources bundle trong module đó → không đụng namespace nhau.
// Đổi ngôn ngữ: changeLanguage() lặp qua MỌI instance → shell + toàn bộ
// remote đổi cùng lúc, không reload.
// ============================================================================

export const SUPPORTED_LANGS: Lang[] = ['vi', 'en'];
export const FALLBACK_LANG: Lang = 'vi';

class I18nService {
  private readonly instances = new Map<string, i18n>();

  /** Lấy (hoặc tạo) instance i18next cho một module, kèm resources của module đó */
  getOrCreate(instanceName: string, resources: Resource): i18n {
    const existing = this.instances.get(instanceName);
    if (existing) return existing;

    const instance = i18next.createInstance();
    instance.use(initReactI18next).init({
      resources,
      lng: globalStore.getState().lang,
      fallbackLng: FALLBACK_LANG,
      supportedLngs: SUPPORTED_LANGS,
      interpolation: { escapeValue: false }, // React đã escape
      initAsync: false, // init đồng bộ — resources đã bundle sẵn
    });
    this.instances.set(instanceName, instance);
    return instance;
  }

  /** Đổi ngôn ngữ ĐỒNG LOẠT mọi instance đã đăng ký */
  changeLanguage(lang: Lang): void {
    for (const instance of this.instances.values()) {
      instance.changeLanguage(lang);
    }
  }

  get registeredNames(): string[] {
    return [...this.instances.keys()];
  }
}

/** Singleton cross-MFE — mọi bundle dùng chung một registry instance */
export const i18nService = getOrCreateSingleton('__APP_I18N_SERVICE__', () => new I18nService());
