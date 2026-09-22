import * as os from 'os'
import * as path from 'path'
import sanitizeFilename from 'sanitize-filename'
import { BaseTerminalTabComponent } from 'tabby-terminal'

export function isSSHTab (tab: BaseTerminalTabComponent): boolean {
    const profile = (tab as any).profile
    return profile?.type === 'ssh'
}

function getTabDisplayName (tab: BaseTerminalTabComponent): string {
    const profile = (tab as any).profile
    if (profile?.type === 'serial' && profile?.options?.port) {
        return profile.options.port
    }

    const sessionProfile = (tab.session as any)?.profile
    if (sessionProfile?.type === 'serial' && sessionProfile?.options?.port) {
        return sessionProfile.options.port
    }

    return tab.customTitle || tab.title || 'Untitled'
}

export function generateOutputFilename (tab: BaseTerminalTabComponent): string {
    const outputName = new Date().toISOString() + ' - ' + getTabDisplayName(tab) + '.log'
    return sanitizeFilename(outputName)
}

export function generateOutputPath (tab: BaseTerminalTabComponent, directory?: string | null): string {
    const outputPath = directory || os.homedir()
    return path.join(outputPath, generateOutputFilename(tab))
}
