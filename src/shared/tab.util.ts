import * as os from 'os'
import * as path from 'path'
import sanitizeFilename from 'sanitize-filename'
import { ConfigService } from 'tabby-core'
import { BaseTerminalTabComponent } from 'tabby-terminal'
import { t } from './i18n'

export function isSSHTab (tab: BaseTerminalTabComponent): boolean {
    const profile = (tab as any).profile
    return profile?.type === 'ssh'
}

export function isSerialTab (tab: BaseTerminalTabComponent): boolean {
    if (tab?.constructor?.name === 'SerialTabComponent') {
        return true
    }

    const profile = getSerialProfile(tab)
    return profile?.type === 'serial'
}

function getSerialProfile (tab: BaseTerminalTabComponent): any | null {
    const profile = (tab as any).profile
    if (profile?.type === 'serial') {
        return profile
    }

    const sessionProfile = (tab.session as any)?.profile
    if (sessionProfile?.type === 'serial') {
        return sessionProfile
    }

    return null
}

function normalizeSerialPortKey (raw: string): string {
    const comMatch = raw.match(/COM\d+/i)
    if (comMatch) {
        return comMatch[0].toUpperCase()
    }
    return raw
}

export function getSerialPort (tab: BaseTerminalTabComponent): string | null {
    const profile = getSerialProfile(tab)
    const options = profile?.options
    if (!options) {
        return null
    }

    const raw = options.port || options.path || options.device
    if (!raw) {
        return null
    }

    return normalizeSerialPortKey(String(raw))
}

function getTabDisplayName (tab: BaseTerminalTabComponent, config: ConfigService): string {
    const port = getSerialPort(tab)
    if (port) {
        return port
    }

    return tab.customTitle || tab.title || t(config, 'tabUntitled')
}

export function generateOutputFilename (tab: BaseTerminalTabComponent, config: ConfigService): string {
    const outputName = new Date().toISOString() + ' - ' + getTabDisplayName(tab, config) + '.log'
    return sanitizeFilename(outputName)
}

export function generateOutputPath (tab: BaseTerminalTabComponent, config: ConfigService, directory?: string | null): string {
    const outputPath = directory || os.homedir()
    return path.join(outputPath, generateOutputFilename(tab, config))
}
