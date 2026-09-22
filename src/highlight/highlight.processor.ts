import Color from 'color'
import { ConfigService, ThemesService } from 'tabby-core'
import { HighlightSlot, UartKitHighlightTab, UartKitHighlightTabState } from '../api'
import { resolveForegroundColor, resolveSlotBackground } from '../shared/color.util'

interface Occurrence {
    start: number
    end: number
    bg: string
    fg: string
}

export function processHighlightOutput (
    data: Buffer,
    tab: UartKitHighlightTab,
    config: ConfigService,
    themes: ThemesService,
): Buffer {
    const state = tab.uartKitHighlight
    if (!state || !hasActiveSlots(state)) {
        return data
    }

    const dataStringRaw = data.toString()
    const lines = dataStringRaw.split('\r\n')
    const highlightedLines: string[] = []
    let changed = false

    for (const line of lines) {
        const highlighted = highlightLine(line, state, config, themes)
        if (highlighted !== line) {
            changed = true
        }
        highlightedLines.push(highlighted)
    }

    if (!changed) {
        return data
    }

    return Buffer.from(highlightedLines.join('\r\n'))
}

function hasActiveSlots (state: UartKitHighlightTabState): boolean {
    return state.slots.some(s => s.enabled && s.keyword)
}

function highlightLine (
    line: string,
    state: UartKitHighlightTabState,
    config: ConfigService,
    themes: ThemesService,
): string {
    const occurrences: Occurrence[] = []

    for (const slot of state.slots) {
        if (!slot.enabled || !slot.keyword) {
            continue
        }
        collectOccurrences(line, slot, config, themes, occurrences)
    }

    if (!occurrences.length) {
        return line
    }

    let result = ''
    for (let i = 0; i < line.length; i++) {
        const subString = line.slice(i)
        const csiMatch = subString.match(/\x1b\[[0-9;?]*[0-9a-zA-Z@]/)
        if (csiMatch && csiMatch.index === 0) {
            i += csiMatch[0].length - 1
            result += csiMatch[0]
            continue
        }

        let char = subString[0]
        const charCode = char.charCodeAt(0)
        if (charCode >= 0xd800 && charCode <= 0xdfff) {
            char += subString[1] || ''
            i++
        }
        if (charCode <= 31 || charCode === 127) {
            result += char
            continue
        }

        for (const occ of occurrences) {
            if (i >= occ.start && i <= occ.end) {
                char = wrapWithColor(char, occ.fg, occ.bg)
                break
            }
        }
        result += char
    }

    return result
}

function collectOccurrences (
    line: string,
    slot: HighlightSlot,
    config: ConfigService,
    themes: ThemesService,
    occurrences: Occurrence[],
) {
    const keyword = slot.keyword
    if (!keyword) {
        return
    }

    const bg = resolveSlotBackground(config, themes, slot.colorIndex)
    const fg = resolveForegroundColor(config)
    let from = 0

    while (from <= line.length - keyword.length) {
        const index = line.indexOf(keyword, from)
        if (index < 0) {
            break
        }
        occurrences.push({
            start: index,
            end: index + keyword.length - 1,
            bg,
            fg,
        })
        from = index + keyword.length
    }
}

function wrapWithColor (char: string, fg: string, bg: string): string {
    const begin: string[] = []
    const end: string[] = []

    try {
        const [br, bgG, bb] = Color(bg).rgb().array()
        begin.push(`48;2;${br};${bgG};${bb}`)
        end.push('49')
    } catch { /* ignore */ }

    try {
        const [fr, fgG, fb] = Color(fg).rgb().array()
        begin.push(`38;2;${fr};${fgG};${fb}`)
        end.push('39')
    } catch { /* ignore */ }

    if (!begin.length) {
        return char
    }
    return `\x1b[${begin.join(';')}m${char}\x1b[${end.join(';')}m`
}
