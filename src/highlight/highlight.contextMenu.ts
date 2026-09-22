import { Injectable } from '@angular/core'
import { ConfigService, MenuItemOptions, ThemesService } from 'tabby-core'
import { BaseTerminalTabComponent, TerminalContextMenuItemProvider } from 'tabby-terminal'
import { UartKitHighlightTab } from '../api'
import { isDarkTheme } from '../shared/color.util'
import { HighlightService } from './highlight.service'

@Injectable()
export class HighlightContextMenu extends TerminalContextMenuItemProvider {
    weight = 2

    constructor (
        private highlightService: HighlightService,
        private config: ConfigService,
        private themes: ThemesService,
    ) {
        super()
    }

    async getItems (tab: BaseTerminalTabComponent): Promise<MenuItemOptions[]> {
        const highlightTab = tab as UartKitHighlightTab
        const state = this.highlightService.ensureTabState(highlightTab)
        const isDark = isDarkTheme(this.config, this.themes)

        const slotItems: MenuItemOptions[] = state.slots.map((slot, i) => {
            const pair = this.config.store.uartKit.highlight.colors[slot.colorIndex]
            const colorLabel = isDark ? pair.dark : pair.light
            const keyword = slot.keyword || '(empty)'
            const status = slot.enabled && slot.keyword ? 'on' : 'off'
            return {
                label: `Slot ${i + 1} [${colorLabel}] ${keyword} [${status}]`,
                enabled: false,
            }
        })

        return [
            { label: 'UART Kit highlights (this tab)', enabled: false },
            ...slotItems,
        ]
    }
}
