import { Frontend } from 'tabby-terminal'
import { UartKitHighlightTab } from '../api'
import { stripUartKitHighlightAnsi } from './highlight.processor'

/** 在终端前端就绪时，用当前 scrollback 建立无高亮的基线 */
export function syncCleanBufferBaseline (tab: UartKitHighlightTab): void {
    if (tab.uartKitCleanSerialized !== undefined) {
        return
    }
    if (!tab.frontendIsReady || !tab.frontend?.saveState) {
        return
    }
    tab.uartKitCleanSerialized = tab.frontend.saveState() as string
}

/** 记录 session 输出的原始内容（未经高亮） */
export function appendCleanBuffer (tab: UartKitHighlightTab, data: Buffer): void {
    const chunk = data.toString()
    if (!chunk) {
        return
    }
    if (tab.uartKitCleanSerialized === undefined) {
        syncCleanBufferBaseline(tab)
        if (tab.uartKitCleanSerialized === undefined) {
            tab.uartKitCleanSerialized = ''
        }
    }
    tab.uartKitCleanSerialized += chunk
}

/** 获取可回刷的干净终端内容 */
export function getCleanBuffer (tab: UartKitHighlightTab, frontend: Frontend): string {
    if (tab.uartKitCleanSerialized !== undefined) {
        return tab.uartKitCleanSerialized
    }

    const serialized = frontend.saveState() as string
    const clean = stripUartKitHighlightAnsi(serialized)
    tab.uartKitCleanSerialized = clean
    return clean
}

export function resetCleanBuffer (tab: UartKitHighlightTab): void {
    tab.uartKitCleanSerialized = undefined
}
