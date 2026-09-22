import { ApplicationRef, Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { SettingsTabProvider } from 'tabby-settings'
import { UartKitSettingsTabComponent } from './settingsTab.component'
import { t } from './shared/i18n'

/** @hidden */
@Injectable()
export class UartKitSettingsTabProvider extends SettingsTabProvider {
    id = 'uart-kit'
    icon = 'microchip'
    title = 'UART Kit'

    constructor (
        private config: ConfigService,
        private appRef: ApplicationRef,
    ) {
        super()
        this.config.ready$.subscribe(() => {
            this.refreshTitle()
        })
        this.config.changed$.subscribe(() => {
            this.refreshTitle()
        })
        this.refreshTitle()
    }

    private refreshTitle (): void {
        const next = t(this.config, 'settingsTitle')
        if (this.title === next) {
            return
        }
        this.title = next
        // provider.title 变更不会自动触发设置侧栏刷新
        this.appRef.tick()
    }

    getComponentType (): any {
        return UartKitSettingsTabComponent
    }
}
