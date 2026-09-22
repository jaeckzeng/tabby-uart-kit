import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'
import { UartKitSettingsTabComponent } from './settingsTab.component'

/** @hidden */
@Injectable()
export class UartKitSettingsTabProvider extends SettingsTabProvider {
    id = 'uart-kit'
    icon = 'microchip'
    title = 'UART Kit'

    getComponentType (): any {
        return UartKitSettingsTabComponent
    }
}
