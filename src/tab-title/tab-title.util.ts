import { AppService, BaseTabComponent } from 'tabby-core'
import { BaseTerminalTabComponent } from 'tabby-terminal'
import { getSerialPort, isSerialTab } from '../shared/tab.util'

const SUFFIX_RE = /^(.+) \((\d+)\)$/

/** 标签栏实际展示的顶层标签（多为 SplitTabComponent） */
export type HeaderTab = BaseTabComponent & {
    customTitle?: string
    title?: string
    disableDynamicTitle?: boolean
    setTitle?: (title: string) => void
    titleChange$?: { subscribe: (fn: () => void) => unknown }
}

export function stripTitleSuffix (title: string): string {
    const match = title.match(SUFFIX_RE)
    return match ? match[1] : title
}

export function formatTitleSuffix (baseTitle: string, index: number): string {
    if (index <= 1) {
        return baseTitle
    }
    return `${baseTitle} (${index})`
}

export function isAutoSuffixedTitle (title: string, baseTitle: string): boolean {
    if (title === baseTitle) {
        return false
    }

    const match = title.match(SUFFIX_RE)
    return !!match && match[1] === baseTitle && Number(match[2]) >= 2
}

export function getHeaderTab (
    app: AppService,
    tab: BaseTerminalTabComponent,
): HeaderTab {
    let header: BaseTabComponent = tab
    let cursor: BaseTabComponent | null = tab.parent || null

    while (cursor) {
        header = cursor
        cursor = cursor.parent || null
    }

    if (app.tabs.includes(header)) {
        return header as HeaderTab
    }

    const fallback = app.getParentTab(tab)
    return (fallback || tab) as HeaderTab
}

export function getHeaderCustomTitle (
    app: AppService,
    tab: BaseTerminalTabComponent,
): string {
    return (getHeaderTab(app, tab).customTitle || '').trim()
}

export function getEffectiveTitle (
    app: AppService,
    tab: BaseTerminalTabComponent,
): string {
    const header = getHeaderTab(app, tab)
    return (header.customTitle || header.title || tab.customTitle || tab.title || '').trim()
}

export function collectAllTabs (app: AppService): BaseTabComponent[] {
    const result: BaseTabComponent[] = []

    const visit = (tab: BaseTabComponent) => {
        const splitTab = tab as { getAllTabs?: () => BaseTabComponent[] }
        if (typeof splitTab.getAllTabs === 'function') {
            for (const child of splitTab.getAllTabs()) {
                visit(child)
            }
            return
        }
        result.push(tab)
    }

    for (const tab of app.tabs) {
        visit(tab)
    }

    return result
}

export function collectSerialTabs (app: AppService): BaseTerminalTabComponent[] {
    return collectAllTabs(app).filter(tab => isSerialTab(tab as BaseTerminalTabComponent)) as BaseTerminalTabComponent[]
}

export function orderTabsByAppPosition (
    app: AppService,
    tabs: BaseTerminalTabComponent[],
): BaseTerminalTabComponent[] {
    const order = new Map<BaseTabComponent, number>()
    collectAllTabs(app).forEach((tab, index) => order.set(tab, index))

    return [...tabs].sort((a, b) => {
        return (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER)
    })
}

export function collectSerialTabsForPort (
    app: AppService,
    port: string,
): BaseTerminalTabComponent[] {
    return collectSerialTabs(app).filter(tab => getSerialPort(tab) === port)
}

export function collectSerialPorts (app: AppService): Set<string> {
    const ports = new Set<string>()
    for (const tab of collectSerialTabs(app)) {
        const port = getSerialPort(tab)
        if (port) {
            ports.add(port)
        }
    }
    return ports
}
