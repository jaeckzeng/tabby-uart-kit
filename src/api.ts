import { BaseTerminalTabComponent } from 'tabby-terminal'

export type AnsiMode = 'strip' | 'raw'

export interface HighlightColorPair {
    light: string
    dark: string
}

export interface HighlightSlot {
    keyword: string
    enabled: boolean
    colorIndex: number
}

export interface UartKitHighlightTabState {
    activeSlot: number
    slots: HighlightSlot[]
}

export interface UartKitHighlightTab extends BaseTerminalTabComponent {
    uartKitHighlight?: UartKitHighlightTabState
}

export const HIGHLIGHT_SLOT_COUNT = 8

export const DEFAULT_HIGHLIGHT_COLORS: HighlightColorPair[] = [
    { light: '#b3d9ff', dark: 'cyan' },
    { light: '#e6ffb3', dark: 'pink' },
    { light: '#b3b3ff', dark: 'lightgreen' },
    { light: '#ffd9b3', dark: 'magenta' },
    { light: '#ffb3ff', dark: 'cornflowerblue' },
    { light: '#b3ffb3', dark: 'orange' },
    { light: '#ffff80', dark: 'green' },
    { light: '#d1e0e0', dark: 'red' },
]

export function createEmptyHighlightState (): UartKitHighlightTabState {
    return {
        activeSlot: 0,
        slots: Array.from({ length: HIGHLIGHT_SLOT_COUNT }, (_, i) => ({
            keyword: '',
            enabled: false,
            colorIndex: i,
        })),
    }
}
