import { ConfigService, ThemesService } from 'tabby-core'
import { UartKitHighlightTab } from '../api'
import { getCleanBuffer } from './highlight.buffer'
import { applyHighlightsToText, hasActiveSlots } from './highlight.processor'

/** 将当前高亮规则回刷到终端已有输出（scrollback + 屏幕） */
export function refreshTerminalHighlights (
    tab: UartKitHighlightTab,
    config: ConfigService,
    themes: ThemesService,
): void {
    const frontend = tab.frontend
    if (!tab.frontendIsReady || !frontend?.saveState || !frontend.clear || !frontend.restoreState) {
        return
    }

    const clean = getCleanBuffer(tab, frontend)
    if (!clean) {
        return
    }

    const state = tab.uartKitHighlight
    const output = state && hasActiveSlots(state)
        ? applyHighlightsToText(clean, state, config, themes)
        : clean

    frontend.clear()
    frontend.restoreState(output)
}
