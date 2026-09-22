import Color from 'color'
import { ConfigService, ThemesService } from 'tabby-core'
import { DEFAULT_HIGHLIGHT_COLORS, HighlightColorPair } from '../api'

export function getHighlightColors (config: ConfigService): HighlightColorPair[] {
    const colors = config.store.uartKit?.highlight?.colors
    return colors?.length ? colors : DEFAULT_HIGHLIGHT_COLORS
}

export function isDarkTheme (config: ConfigService, themes: ThemesService): boolean {
    const scheme = config.store.appearance?.colorScheme
    if (scheme === 'dark' || scheme === 'light') {
        return scheme === 'dark'
    }
    const theme = themes.findCurrentTheme()
    if (theme?.name) {
        return /dark/i.test(theme.name)
    }
    return false
}

export function resolveSlotBackground (
    config: ConfigService,
    themes: ThemesService,
    colorIndex: number,
): string {
    const colors = getHighlightColors(config)
    const pair = colors[colorIndex] || colors[0]
    const raw = isDarkTheme(config, themes) ? pair.dark : pair.light
    try {
        return Color(raw).hex()
    } catch {
        return '#ffff80'
    }
}

export function resolveForegroundColor (config: ConfigService): string {
    return config.store.uartKit?.highlight?.foregroundColor || '#000000'
}
