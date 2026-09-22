import { Injectable } from '@angular/core'
import { ConfigService, HotkeyDescription, HotkeyProvider } from 'tabby-core'
import { t } from '../shared/i18n'

@Injectable()
export class HighlightHotkeyProvider extends HotkeyProvider {
    constructor (private config: ConfigService) {
        super()
    }

    async provide (): Promise<HotkeyDescription[]> {
        return [
            { id: 'uart-toggle-highlight', name: t(this.config, 'hotkeyToggle') },
            { id: 'uart-clear-highlight', name: t(this.config, 'hotkeyClear') },
        ]
    }
}
