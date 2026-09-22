import { ConfigService } from 'tabby-core'

export type UartKitLocale = 'zh' | 'en'

export interface UartKitMessages {
    settingsTitle: string
    saveLogSection: string
    ansiTitle: string
    ansiDesc: string
    ansiStrip: string
    ansiRaw: string
    autoSaveTitle: string
    autoSaveDesc: string
    autoSaveOn: string
    autoSaveSsh: string
    autoSaveOff: string
    directoryTitle: string
    directoryDesc: string
    homeDirectoryPlaceholder: string
    highlightSection: string
    highlightHelp: string
    slotBgTitle: string
    slotBgDesc: string
    lightPlaceholder: string
    darkPlaceholder: string
    hotkeysTitle: string
    hotkeysDesc: string
    hotkeyToggleHelp: string
    hotkeyClearHelp: string
    menuSaveOutput: string
    toastLogSaved: string
    toastSelectTextFirst: string
    toastHighlightEnabled: string
    toastHighlightDisabled: string
    toastSlotMarked: string
    toastClearedAll: string
    hotkeyToggle: string
    hotkeyClear: string
    tabUntitled: string
    saveRecording: string
    saveStop: string
}

const ZH: UartKitMessages = {
    settingsTitle: 'UART 工具包',
    saveLogSection: '日志保存',
    ansiTitle: 'ANSI 颜色处理',
    ansiDesc: '保存日志时如何处理终端颜色码',
    ansiStrip: '去除 ANSI（纯文本）',
    ansiRaw: '保留 ANSI（原始）',
    autoSaveTitle: '新标签页自动保存',
    autoSaveDesc: '将完整会话日志保存到指定目录',
    autoSaveOn: '开启',
    autoSaveSsh: '仅 SSH',
    autoSaveOff: '关闭',
    directoryTitle: '保存目录',
    directoryDesc: '日志文件存放路径',
    homeDirectoryPlaceholder: '用户主目录',
    highlightSection: '关键字高亮',
    highlightHelp: '在终端选中文字后按 F8 标记/取消高亮，Shift+F8 清除当前窗口全部高亮。样式为明亮底色 + 黑字，8 个槽位各用一种颜色。',
    slotBgTitle: '槽位 {n} 底色',
    slotBgDesc: '浅色主题 / 深色主题',
    lightPlaceholder: '浅色 (#hex)',
    darkPlaceholder: '深色（名称或 #hex）',
    hotkeysTitle: '快捷键',
    hotkeysDesc: '可在 设置 → 快捷键 中修改',
    hotkeyToggleHelp: 'F8 — 对选中文字切换高亮',
    hotkeyClearHelp: 'Shift+F8 — 清除当前窗口全部高亮',
    menuSaveOutput: '保存输出到文件...',
    toastLogSaved: '日志已保存',
    toastSelectTextFirst: '请先选中要高亮的文字',
    toastHighlightEnabled: '已启用高亮: {text}',
    toastHighlightDisabled: '已取消高亮: {text}',
    toastSlotMarked: '槽位 {slot} 已标记: {text}',
    toastClearedAll: '已清除当前窗口全部高亮',
    hotkeyToggle: 'UART 工具包：切换关键字高亮',
    hotkeyClear: 'UART 工具包：清除全部高亮',
    tabUntitled: '未命名',
    saveRecording: '正在录制输出',
    saveStop: '停止',
}

const EN: UartKitMessages = {
    settingsTitle: 'UART Kit',
    saveLogSection: 'Save Log',
    ansiTitle: 'ANSI color handling',
    ansiDesc: 'How to handle terminal color codes in saved logs',
    ansiStrip: 'Strip ANSI colors (plain text)',
    ansiRaw: 'Keep ANSI colors (raw)',
    autoSaveTitle: 'Automatically save output for new tabs',
    autoSaveDesc: 'Stores complete session logs in a directory',
    autoSaveOn: 'On',
    autoSaveSsh: 'For SSH only',
    autoSaveOff: 'Off',
    directoryTitle: 'Directory',
    directoryDesc: 'Destination path for the logs',
    homeDirectoryPlaceholder: 'Home directory',
    highlightSection: 'Highlight',
    highlightHelp: 'Select text in terminal and press F8 to mark/unmark. Shift+F8 clears all highlights in the current tab. Style: bright background + black text, 8 color slots.',
    slotBgTitle: 'Slot {n} background colors',
    slotBgDesc: 'Light theme / Dark theme',
    lightPlaceholder: 'Light (#hex)',
    darkPlaceholder: 'Dark (name or #hex)',
    hotkeysTitle: 'Hotkeys',
    hotkeysDesc: 'Configure in Settings → Hotkeys',
    hotkeyToggleHelp: 'F8 — toggle highlight on selected text',
    hotkeyClearHelp: 'Shift+F8 — clear all highlights in current tab',
    menuSaveOutput: 'Save output to file...',
    toastLogSaved: 'File saved',
    toastSelectTextFirst: 'Select text to highlight first',
    toastHighlightEnabled: 'Highlight enabled: {text}',
    toastHighlightDisabled: 'Highlight disabled: {text}',
    toastSlotMarked: 'Slot {slot} marked: {text}',
    toastClearedAll: 'Cleared all highlights in current tab',
    hotkeyToggle: 'UART Kit: Toggle keyword highlight',
    hotkeyClear: 'UART Kit: Clear all highlights',
    tabUntitled: 'Untitled',
    saveRecording: 'Recording output',
    saveStop: 'Stop',
}

/** 与 Tabby LocaleService 一致：优先读 config.store.language */
export function resolveLocale (config?: ConfigService): UartKitLocale {
    if (!config?.store) {
        return 'en'
    }

    let lang = config.store.language as string | undefined
    if (!lang && typeof navigator !== 'undefined') {
        for (const systemLang of navigator.languages ?? []) {
            if (systemLang.toLowerCase().startsWith('zh')) {
                lang = 'zh-CN'
                break
            }
        }
    }

    lang ??= 'en-US'
    return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function messages (locale: UartKitLocale): UartKitMessages {
    return locale === 'zh' ? ZH : EN
}

export function t (
    config: ConfigService,
    key: keyof UartKitMessages,
    params?: Record<string, string | number>,
): string {
    let text = messages(resolveLocale(config))[key]
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
    }
    return text
}

export function slotBgTitle (config: ConfigService, index: number): string {
    return t(config, 'slotBgTitle', { n: index + 1 })
}
