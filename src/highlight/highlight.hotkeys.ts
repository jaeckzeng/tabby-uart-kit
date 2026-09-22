import { Injectable } from '@angular/core'
import { HotkeyDescription, HotkeyProvider } from 'tabby-core'

@Injectable()
export class HighlightHotkeyProvider extends HotkeyProvider {
    async provide (): Promise<HotkeyDescription[]> {
        return [
            { id: 'uart-toggle-highlight', name: 'UART Kit: Toggle keyword highlight' },
            { id: 'uart-clear-highlight', name: 'UART Kit: Clear all highlights' },
        ]
    }
}
