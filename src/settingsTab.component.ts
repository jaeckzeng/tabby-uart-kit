/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ChangeDetectorRef, Component } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { ElectronHostWindow, ElectronService } from 'tabby-electron'
import { DEFAULT_HIGHLIGHT_COLORS, HIGHLIGHT_SLOT_COUNT } from './api'
import { getSaveLogConfig } from './config'
import { messages, resolveLocale, slotBgTitle, UartKitMessages } from './shared/i18n'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
})
export class UartKitSettingsTabComponent {
    slotCount = HIGHLIGHT_SLOT_COUNT

    constructor (
        public config: ConfigService,
        private electron: ElectronService,
        private hostWindow: ElectronHostWindow,
        private cdr: ChangeDetectorRef,
    ) {
        this.ensureUartKitConfig()
        this.config.changed$.subscribe(() => {
            this.cdr.detectChanges()
        })
    }

    get L (): UartKitMessages {
        return messages(resolveLocale(this.config))
    }

    slotTitle (index: number): string {
        return slotBgTitle(this.config, index)
    }

    private ensureUartKitConfig (): void {
        if (!this.config.store.uartKit) {
            this.config.store.uartKit = {
                saveLog: getSaveLogConfig(this.config.store),
                highlight: {
                    foregroundColor: '#000000',
                    colors: [],
                },
            }
        }
        if (!this.config.store.uartKit.highlight?.colors?.length) {
            this.config.store.uartKit.highlight.colors = DEFAULT_HIGHLIGHT_COLORS
        }
    }

    get saveLog () {
        return getSaveLogConfig(this.config.store)
    }

    syncSaveLog (): void {
        if (!this.config.store.uartKit) {
            this.config.store.uartKit = { saveLog: {}, highlight: {} }
        }
        this.config.store.uartKit.saveLog = {
            autoSave: this.saveLog.autoSave,
            autoSaveDirectory: this.saveLog.autoSaveDirectory,
            ansiMode: this.saveLog.ansiMode,
        }
        this.config.save()
    }

    onSaveLogChange (): void {
        this.syncSaveLog()
    }

    onHighlightChange (): void {
        this.config.save()
    }

    async pickDirectory (): Promise<void> {
        const paths = (await this.electron.dialog.showOpenDialog(
            this.hostWindow.getWindow(),
            { properties: ['openDirectory', 'showHiddenFiles'] },
        )).filePaths
        if (paths[0]) {
            this.saveLog.autoSaveDirectory = paths[0]
            this.syncSaveLog()
        }
    }
}
