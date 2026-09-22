import { Injectable } from '@angular/core'
import { AppService } from 'tabby-core'
import { BaseTerminalTabComponent, TerminalDecorator } from 'tabby-terminal'
import { isSerialTab } from '../shared/tab.util'
import { TabTitleService } from './tab-title.service'
import { getHeaderCustomTitle, getHeaderTab } from './tab-title.util'

const ATTACH_RETRY_MS = [100, 500, 1200]
const SESSION_RETRY_MS = [300, 1000]

@Injectable()
export class TabTitleDecorator extends TerminalDecorator {
    constructor (
        private tabTitle: TabTitleService,
        private app: AppService,
    ) {
        super()
    }

    attach (tab: BaseTerminalTabComponent): void {
        if (!this.tabTitle.isEnabled() || !isSerialTab(tab)) {
            return
        }

        this.tabTitle.scheduleSync(0)
        for (const delay of ATTACH_RETRY_MS) {
            this.tabTitle.scheduleRetrySync(delay)
        }

        const header = getHeaderTab(this.app, tab)
        if (header !== tab && header.titleChange$) {
            header.titleChange$.subscribe(() => {
                this.tabTitle.onTitleMaybeChanged(tab, 50)
            })
        }

        // 已有 customTitle 时再次重命名不会触发 titleChange$，需轮询外层标题
        let lastHeaderCustom = getHeaderCustomTitle(this.app, tab)
        const headerWatch = setInterval(() => {
            const next = getHeaderCustomTitle(this.app, tab)
            if (!next || next === lastHeaderCustom) {
                return
            }
            lastHeaderCustom = next
            this.tabTitle.onTitleMaybeChanged(tab)
        }, 300)
        tab.destroyed$?.subscribe(() => clearInterval(headerWatch))

        if (tab.sessionChanged$) {
            tab.sessionChanged$.subscribe(session => {
                if (!session) {
                    return
                }
                this.tabTitle.scheduleSync(0)
                for (const delay of SESSION_RETRY_MS) {
                    this.tabTitle.scheduleRetrySync(delay)
                }
            })
        }

        if (tab.titleChange$) {
            tab.titleChange$.subscribe(() => {
                this.tabTitle.onTitleMaybeChanged(tab)
            })
        }
    }
}
