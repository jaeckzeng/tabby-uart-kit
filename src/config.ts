import { ConfigProvider } from 'tabby-core'
import { DEFAULT_HIGHLIGHT_COLORS } from './api'

/** @hidden */
export class UartKitConfigProvider extends ConfigProvider {
    defaults = {
        uartKit: {
            saveLog: {
                autoSave: 'off',
                autoSaveDirectory: null,
                ansiMode: 'strip',
            },
            highlight: {
                foregroundColor: '#000000',
                colors: DEFAULT_HIGHLIGHT_COLORS,
            },
            tabTitles: {
                persist: true,
                byPort: {},
            },
        },
        hotkeys: {
            'uart-toggle-highlight': ['F8'],
            'uart-clear-highlight': ['Shift-F8'],
        },
        // backward compat with tabby-save-output settings
        saveOutput: {
            autoSave: 'off',
            autoSaveDirectory: null,
            ansiMode: 'strip',
        },
    }

    platformDefaults = { }
}

export function getSaveLogConfig (store: any) {
    return store.uartKit?.saveLog ?? store.saveOutput ?? {
        autoSave: 'off',
        autoSaveDirectory: null,
        ansiMode: 'strip',
    }
}
