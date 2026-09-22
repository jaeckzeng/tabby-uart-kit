import { ConfigService } from 'tabby-core'
import { t } from '../shared/i18n'

export function renderSaveUi (config: ConfigService): string {
    return [
        '<i class="fa fa-cog mr-3 text-danger fa-spin"></i>',
        `<span>${t(config, 'saveRecording')}</span>`,
        `<button class="btn btn-outline-danger ml-3">${t(config, 'saveStop')}</button>`,
    ].join('')
}
