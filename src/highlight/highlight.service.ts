import { Injectable } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { AppService, HotkeysService, SplitTabComponent } from 'tabby-core'
import { BaseTerminalTabComponent } from 'tabby-terminal'
import {
    createEmptyHighlightState,
    HIGHLIGHT_SLOT_COUNT,
    UartKitHighlightTab,
    UartKitHighlightTabState,
} from '../api'

@Injectable({ providedIn: 'root' })
export class HighlightService {
    constructor (
        private app: AppService,
        private hotkeys: HotkeysService,
        private toastr: ToastrService,
    ) {
        this.hotkeys.hotkey$.subscribe(hotkey => {
            if (hotkey === 'uart-toggle-highlight') {
                this.toggleHighlightOnSelection()
            } else if (hotkey === 'uart-clear-highlight') {
                this.clearCurrentTabHighlights()
            }
        })
    }

    ensureTabState (tab: UartKitHighlightTab): UartKitHighlightTabState {
        if (!tab.uartKitHighlight) {
            tab.uartKitHighlight = createEmptyHighlightState()
        }
        return tab.uartKitHighlight
    }

    getFocusedTerminalTab (): UartKitHighlightTab | null {
        for (const tab of this.app.tabs) {
            if (tab instanceof SplitTabComponent) {
                for (const subTab of tab.getAllTabs()) {
                    if (subTab instanceof BaseTerminalTabComponent && subTab.hasFocus) {
                        return subTab as UartKitHighlightTab
                    }
                }
            } else if (tab instanceof BaseTerminalTabComponent && tab.hasFocus) {
                return tab as UartKitHighlightTab
            }
        }
        return null
    }

    toggleHighlightOnSelection (): void {
        const tab = this.getFocusedTerminalTab()
        if (!tab) {
            return
        }

        const selection = (tab.frontend?.getSelection() ?? '').trim()
        if (!selection) {
            this.toastr.info('请先选中要高亮的文字')
            return
        }

        const state = this.ensureTabState(tab)
        const existingIndex = state.slots.findIndex(s => s.keyword === selection)

        if (existingIndex >= 0) {
            const slot = state.slots[existingIndex]
            slot.enabled = !slot.enabled
            this.toastr.info(slot.enabled ? `已启用高亮: ${selection}` : `已取消高亮: ${selection}`)
            return
        }

        const slotIndex = state.activeSlot
        const slot = state.slots[slotIndex]
        slot.keyword = selection
        slot.enabled = true
        slot.colorIndex = slotIndex

        state.activeSlot = (slotIndex + 1) % HIGHLIGHT_SLOT_COUNT
        this.toastr.info(`槽位 ${slotIndex + 1} 已标记: ${selection}`)
    }

    clearCurrentTabHighlights (): void {
        const tab = this.getFocusedTerminalTab()
        if (!tab || !tab.uartKitHighlight) {
            return
        }

        for (const slot of tab.uartKitHighlight.slots) {
            slot.enabled = false
        }
        this.toastr.info('已清除当前窗口全部高亮')
    }
}
