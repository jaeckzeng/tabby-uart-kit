import { Injectable } from '@angular/core'
import { ConfigService, ThemesService } from 'tabby-core'
import { BaseSession, BaseTerminalTabComponent, TerminalDecorator } from 'tabby-terminal'
import { UartKitHighlightTab } from '../api'
import { appendCleanBuffer, resetCleanBuffer, syncCleanBufferBaseline } from './highlight.buffer'
import { HighlightService } from './highlight.service'
import { processHighlightOutput } from './highlight.processor'

@Injectable()
export class HighlightDecorator extends TerminalDecorator {
    constructor (
        private highlightService: HighlightService,
        private config: ConfigService,
        private themes: ThemesService,
    ) {
        super()
    }

    attach (tab: BaseTerminalTabComponent): void {
        const highlightTab = tab as UartKitHighlightTab
        this.highlightService.ensureTabState(highlightTab)

        if (tab.frontendReady$) {
            tab.frontendReady$.subscribe(() => {
                syncCleanBufferBaseline(highlightTab)
            })
        }
        if (tab.frontendIsReady) {
            syncCleanBufferBaseline(highlightTab)
        }

        if (tab.sessionChanged$) {
            tab.sessionChanged$.subscribe(session => {
                resetCleanBuffer(highlightTab)
                if (session) {
                    this.attachToSession(session, highlightTab)
                    setTimeout(() => syncCleanBufferBaseline(highlightTab), 0)
                }
            })
        }
        if (tab.session) {
            this.attachToSession(tab.session, highlightTab)
        }
    }

    private attachToSession (session: BaseSession, tab: UartKitHighlightTab) {
        const sessionAny = session as any
        if (sessionAny._uartKitHighlightAttached) {
            return
        }
        sessionAny._uartKitHighlightAttached = true

        const originalEmit = session.emitOutput.bind(session)
        session.emitOutput = (data: Buffer) => {
            appendCleanBuffer(tab, data)
            data = processHighlightOutput(data, tab, this.config, this.themes)
            originalEmit(data)
        }
    }
}
