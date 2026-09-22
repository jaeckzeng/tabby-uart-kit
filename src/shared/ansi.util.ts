import stripAnsi from 'strip-ansi'
import { AnsiMode } from '../api'

export function processOutput (data: string, mode: AnsiMode): string {
    if (mode === 'raw') {
        return data
    }
    return stripAnsi(data)
}
