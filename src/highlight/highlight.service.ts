import { Injectable } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { AppService, ConfigService, HotkeysService, SplitTabComponent, ThemesService } from 'tabby-core'
import { BaseTerminalTabComponent } from 'tabby-terminal'
import { t } from '../shared/i18n'
import { refreshTerminalHighlights } from './highlight.refresh'
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
        private config: ConfigService,
        private themes: ThemesService,
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
            this.toastr.info(t(this.config, 'toastSelectTextFirst'))
            return
        }

        const state = this.ensureTabState(tab)
        const existingIndex = state.slots.findIndex(s => s.keyword === selection)

        if (existingIndex >= 0) {
            const slot = state.slots[existingIndex]
            slot.enabled = !slot.enabled
            this.toastr.info(slot.enabled
                ? t(this.config, 'toastHighlightEnabled', { text: selection })
                : t(this.config, 'toastHighlightDisabled', { text: selection }))
            refreshTerminalHighlights(tab, this.config, this.themes)
            return
        }

        const slotIndex = state.activeSlot
        const slot = state.slots[slotIndex]
        slot.keyword = selection
        slot.enabled = true
        slot.colorIndex = slotIndex

        state.activeSlot = (slotIndex + 1) % HIGHLIGHT_SLOT_COUNT
        this.toastr.info(t(this.config, 'toastSlotMarked', { slot: slotIndex + 1, text: selection }))
        refreshTerminalHighlights(tab, this.config, this.themes)
    }

    clearCurrentTabHighlights (): void {
        const tab = this.getFocusedTerminalTab()
        if (!tab || !tab.uartKitHighlight) {
            return
        }

        for (const slot of tab.uartKitHighlight.slots) {
            slot.enabled = false
        }
        this.toastr.info(t(this.config, 'toastClearedAll'))
        refreshTerminalHighlights(tab, this.config, this.themes)
    }
}
