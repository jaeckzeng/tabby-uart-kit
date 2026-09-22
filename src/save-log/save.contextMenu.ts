import * as fs from 'fs'
import { Injectable } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { ConfigService, MenuItemOptions } from 'tabby-core'
import { ElectronService, ElectronHostWindow } from 'tabby-electron'
import { BaseTerminalTabComponent, TerminalContextMenuItemProvider } from 'tabby-terminal'
import { getSaveLogConfig } from '../config'
import { processOutput } from '../shared/ansi.util'
import { generateOutputPath } from '../shared/tab.util'

import './save.styles.scss'

@Injectable()
export class SaveLogContextMenu extends TerminalContextMenuItemProvider {
    weight = 1

    constructor (
        private toastr: ToastrService,
        private electron: ElectronService,
        private hostWindow: ElectronHostWindow,
        private config: ConfigService,
    ) {
        super()
    }

    async getItems (tab: BaseTerminalTabComponent): Promise<MenuItemOptions[]> {
        return [
            {
                label: 'Save output to file...',
                click: () => {
                    setTimeout(() => this.start(tab))
                },
            },
        ]
    }

    start (tab: BaseTerminalTabComponent) {
        if ((tab as any)._uartKitSaveActive) {
            return
        }

        const saveLog = getSaveLogConfig(this.config.store)
        let path = this.electron.dialog.showSaveDialogSync(
            this.hostWindow.getWindow(),
            { defaultPath: generateOutputPath(tab, saveLog.autoSaveDirectory) }
        )

        if (!path) {
            return
        }

        let ui: HTMLElement = document.createElement('div')
        ui.classList.add('uart-kit-save-ui')
        tab.element.nativeElement.querySelector('.content').appendChild(ui)
        ui.innerHTML = require('./save.ui.pug')

        let stream = fs.createWriteStream(path)
        const ansiMode = saveLog.ansiMode || 'strip'

        let subscription = tab.output$.subscribe(data => {
            data = processOutput(data, ansiMode)
            stream.write(data, 'utf8')
        })

        ;(tab as any)._uartKitSaveActive = true

        const stopBtn = ui.querySelector('button')
        stopBtn?.addEventListener('click', () => {
            ;(tab as any)._uartKitSaveActive = false
            tab.element.nativeElement.querySelector('.content').removeChild(ui)
            subscription.unsubscribe()
            stream.end()
            this.toastr.info('File saved')
        })
    }
}
