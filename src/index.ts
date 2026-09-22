import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import TabbyCoreModule, { ConfigProvider, HotkeyProvider } from 'tabby-core'
import { TerminalContextMenuItemProvider, TerminalDecorator } from 'tabby-terminal'
import { SettingsTabProvider } from 'tabby-settings'

import { UartKitConfigProvider } from './config'
import { UartKitSettingsTabProvider } from './settings'
import { UartKitSettingsTabComponent } from './settingsTab.component'
import { SaveLogDecorator } from './save-log/save.decorator'
import { SaveLogContextMenu } from './save-log/save.contextMenu'
import { HighlightDecorator } from './highlight/highlight.decorator'
import { HighlightHotkeyProvider } from './highlight/highlight.hotkeys'
import { HighlightService } from './highlight/highlight.service'
import { TabTitleDecorator } from './tab-title/tab-title.decorator'
import { TabTitleService } from './tab-title/tab-title.service'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TabbyCoreModule,
    ],
    providers: [
        HighlightService,
        TabTitleService,
        { provide: ConfigProvider, useClass: UartKitConfigProvider, multi: true },
        { provide: HotkeyProvider, useClass: HighlightHotkeyProvider, multi: true },
        { provide: SettingsTabProvider, useClass: UartKitSettingsTabProvider, multi: true },
        { provide: TerminalDecorator, useClass: SaveLogDecorator, multi: true },
        { provide: TerminalDecorator, useClass: HighlightDecorator, multi: true },
        { provide: TerminalDecorator, useClass: TabTitleDecorator, multi: true },
        { provide: TerminalContextMenuItemProvider, useClass: SaveLogContextMenu, multi: true },
    ],
    entryComponents: [
        UartKitSettingsTabComponent,
    ],
    declarations: [
        UartKitSettingsTabComponent,
    ],
})
export default class UartKitModule { }
