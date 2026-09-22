import { ConfigService } from 'tabby-core'

export type TabTitlesConfig = {
    persist?: boolean
    byPort?: Record<string, string>
}

function getRawStore (config: ConfigService): any {
    return (config as any)._store || config.store
}

function ensureTabTitlesStore (store: any): TabTitlesConfig {
    if (!store.uartKit) {
        store.uartKit = {}
    }
    if (!store.uartKit.tabTitles || typeof store.uartKit.tabTitles !== 'object') {
        store.uartKit.tabTitles = { persist: true, byPort: {} }
    }

    const tabTitles = store.uartKit.tabTitles as TabTitlesConfig
    if (!tabTitles.byPort || typeof tabTitles.byPort !== 'object') {
        tabTitles.byPort = {}
    }
    if (tabTitles.persist === undefined) {
        tabTitles.persist = true
    }
    return tabTitles
}

export function isTabTitlePersistEnabled (config: ConfigService): boolean {
    const store = getRawStore(config)
    return store?.uartKit?.tabTitles?.persist !== false
}

export function getSavedTabTitle (config: ConfigService, port: string): string | null {
    const store = getRawStore(config)
    const title = store?.uartKit?.tabTitles?.byPort?.[port]
    return title || null
}

export function saveTabTitle (config: ConfigService, port: string, baseTitle: string): boolean {
    const store = getRawStore(config)
    if (!store) {
        return false
    }

    const tabTitles = ensureTabTitlesStore(store)
    if (tabTitles.byPort![port] === baseTitle) {
        return false
    }

    tabTitles.byPort![port] = baseTitle

    // 同步 ConfigProxy，避免 UI 读到旧值
    try {
        const proxyTitles = config.store?.uartKit?.tabTitles
        if (proxyTitles) {
            proxyTitles.byPort = { ...tabTitles.byPort }
        }
    } catch {
        // ignore proxy sync errors
    }

    void config.save()
    return true
}
