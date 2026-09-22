import * as fs from 'fs'
import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { TerminalDecorator, BaseTerminalTabComponent, BaseSession } from 'tabby-terminal'
import { getSaveLogConfig } from '../config'
import { processOutput } from '../shared/ansi.util'
import { generateOutputPath, isSSHTab } from '../shared/tab.util'

@Injectable()
export class SaveLogDecorator extends TerminalDecorator {
    constructor (
        private config: ConfigService,
    ) {
        super()
    }

    attach (tab: BaseTerminalTabComponent): void {
        const saveLog = getSaveLogConfig(this.config.store)
        if (saveLog.autoSave === 'off' || saveLog.autoSave === 'ssh' && !isSSHTab(tab)) {
            return
        }

        if (tab.sessionChanged$) {
            tab.sessionChanged$.subscribe(session => {
                if (session) {
                    this.attachToSession(session, tab)
                }
            })
        }
        if (tab.session) {
            this.attachToSession(tab.session, tab)
        }
    }

    private attachToSession (session: BaseSession, tab: BaseTerminalTabComponent) {
        let outputPath = this.generatePath(tab)
        const stream = fs.createWriteStream(outputPath)
        let dataLength = 0

        setTimeout(() => {
            let newPath = this.generatePath(tab)
            fs.rename(outputPath, newPath, err => {
                if (!err) {
                    outputPath = newPath
                }
            })
        }, 5000)

        const saveLog = getSaveLogConfig(this.config.store)
        const ansiMode = saveLog.ansiMode || 'strip'

        session.output$.subscribe(data => {
            data = processOutput(data, ansiMode)
            dataLength += data.length
            stream.write(data, 'utf8')
        })

        session.destroyed$.subscribe(() => {
            stream.close()
            if (!dataLength) {
                fs.unlink(outputPath, () => null)
            }
        })
    }

    private generatePath (tab: BaseTerminalTabComponent): string {
        const saveLog = getSaveLogConfig(this.config.store)
        return generateOutputPath(tab, saveLog.autoSaveDirectory)
    }
}
