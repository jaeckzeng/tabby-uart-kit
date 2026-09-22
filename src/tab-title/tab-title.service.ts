import { Injectable } from '@angular/core'
import { AppService, ConfigService } from 'tabby-core'
import { BaseTerminalTabComponent } from 'tabby-terminal'
import { first } from 'rxjs/operators'
import { getSerialPort, isSerialTab } from '../shared/tab.util'
import {
    getSavedTabTitle,
    isTabTitlePersistEnabled,
    saveTabTitle,
} from './tab-title.config'
import {
    collectSerialPorts,
    collectSerialTabs,
    collectSerialTabsForPort,
    formatTitleSuffix,
    getEffectiveTitle,
    getHeaderCustomTitle,
    getHeaderTab,
    isAutoSuffixedTitle,
    orderTabsByAppPosition,
    stripTitleSuffix,
} from './tab-title.util'

const SYNC_DEBOUNCE_MS = 50
const STARTUP_RETRY_MS = [500, 2000]
const TAB_OPEN_RETRY_MS = [300, 800]

type ManagedTab = BaseTerminalTabComponent & {
    _uartKitLastAppliedTitle?: string
}

@Injectable()
export class TabTitleService {
    private debounceTimer: ReturnType<typeof setTimeout> | null = null
    private applying = new WeakSet<BaseTerminalTabComponent>()
    private lastSeenCustomTitle = new WeakMap<BaseTerminalTabComponent, string>()

    constructor (
        private config: ConfigService,
        private app: AppService,
    ) {
        this.config.ready$.pipe(first()).subscribe(() => {
            for (const delay of STARTUP_RETRY_MS) {
                this.scheduleRetrySync(delay)
            }
        })

        this.app.tabsChanged$.subscribe(() => {
            // 必须先检测重命名并写入配置，再同步；否则 sync 会用旧配置覆盖用户刚改的名称
            this.checkAllRenames()
            this.scheduleSync()
        })

        this.app.tabOpened$.subscribe(() => {
            this.scheduleSync(0)
            for (const delay of TAB_OPEN_RETRY_MS) {
                this.scheduleRetrySync(delay)
            }
        })
    }

    isEnabled (): boolean {
        return isTabTitlePersistEnabled(this.config)
    }

    getSavedTitle (port: string): string | null {
        return getSavedTabTitle(this.config, port)
    }

    /** 短延迟去抖；多次调用会合并为一次 */
    scheduleSync (delayMs = SYNC_DEBOUNCE_MS): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
        }
        this.debounceTimer = setTimeout(() => {
            this.debounceTimer = null
            this.syncAllSerialTitles()
        }, delayMs)
    }

    /** 独立重试，不与去抖互斥 */
    scheduleRetrySync (delayMs: number): void {
        setTimeout(() => this.syncAllSerialTitles(), delayMs)
    }

    syncAllSerialTitles (): void {
        if (!this.isEnabled()) {
            return
        }

        for (const port of collectSerialPorts(this.app)) {
            this.syncPortGroup(port)
        }
    }

    checkRenamed (tab: BaseTerminalTabComponent): void {
        if (!this.isEnabled() || !isSerialTab(tab) || this.applying.has(tab)) {
            return
        }

        const port = getSerialPort(tab)
        const customTitle = getHeaderCustomTitle(this.app, tab)
        if (!port || !customTitle) {
            return
        }

        const previous = this.lastSeenCustomTitle.get(tab)
        if (customTitle === previous) {
            return
        }

        const managed = tab as ManagedTab
        if (customTitle === managed._uartKitLastAppliedTitle) {
            this.lastSeenCustomTitle.set(tab, customTitle)
            return
        }

        const savedBase = this.getSavedTitle(port)
        if (savedBase && isAutoSuffixedTitle(customTitle, savedBase)) {
            managed._uartKitLastAppliedTitle = customTitle
            this.lastSeenCustomTitle.set(tab, customTitle)
            return
        }

        this.lastSeenCustomTitle.set(tab, customTitle)
        managed.disableDynamicTitle = true
        managed._uartKitLastAppliedTitle = customTitle
        saveTabTitle(this.config, port, stripTitleSuffix(customTitle))
        this.syncPortGroup(port)
    }

    checkAllRenames (): void {
        for (const tab of collectSerialTabs(this.app)) {
            this.checkRenamed(tab)
        }
    }

    onTitleMaybeChanged (tab: BaseTerminalTabComponent, delayMs = 0): void {
        setTimeout(() => {
            this.checkRenamed(tab)
            this.scheduleSync()
        }, delayMs)
    }

    private syncPortGroup (port: string): void {
        const baseTitle = this.getSavedTitle(port)
        if (!baseTitle) {
            return
        }

        const tabs = orderTabsByAppPosition(this.app, collectSerialTabsForPort(this.app, port))
        tabs.forEach((tab, index) => {
            const expected = index === 0
                ? baseTitle
                : formatTitleSuffix(baseTitle, index + 1)
            this.applyManagedTitle(tab, expected)
        })
    }

    private applyManagedTitle (tab: BaseTerminalTabComponent, title: string): void {
        const header = getHeaderTab(this.app, tab)
        const managed = tab as ManagedTab
        const current = getEffectiveTitle(this.app, tab)
        const headerCustom = (header.customTitle || '').trim()

        // 用户刚改的名称尚未写入配置时，不要用旧配置覆盖
        if (
            headerCustom
            && headerCustom !== title
            && headerCustom !== managed._uartKitLastAppliedTitle
        ) {
            return
        }

        if (
            current === title
            && managed._uartKitLastAppliedTitle === title
            && header.customTitle === title
            && header.disableDynamicTitle
        ) {
            this.lastSeenCustomTitle.set(tab, title)
            return
        }

        this.applying.add(tab)

        header.customTitle = title
        header.disableDynamicTitle = true
        header.setTitle?.(title)

        tab.disableDynamicTitle = true
        managed._uartKitLastAppliedTitle = title
        this.lastSeenCustomTitle.set(tab, title)

        setTimeout(() => this.applying.delete(tab), 0)
    }
}
