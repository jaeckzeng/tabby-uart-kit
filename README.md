# UART Kit for Tabby

[![npm](https://img.shields.io/npm/v/tabby-uart-kit?label=version)](https://www.npmjs.com/package/tabby-uart-kit)
[![license](https://img.shields.io/github/license/jaeckzeng/tabby-uart-kit)](LICENSE)

> Tabby 串口 / UART 调试工具插件：**日志保存** + **手动关键字高亮**，面向嵌入式开发时分析串口输出。

## 项目说明

| 项 | 内容 |
|---|---|
| 名称 | **tabby-uart-kit** |
| 版本 | 1.1.2 |
| 仓库 | https://github.com/jaeckzeng/tabby-uart-kit |
| 作者 | jack (jaeck_zj@163.com) |
| 协议 | MIT |
| 类型 | Tabby 插件（`tabby-plugin`） |

**适用场景**

- 串口调试时保存完整会话日志（`.log`），支持 ANSI 过滤或原样保留
- 分析大量 log 时，手动标记关键字并着色区分（ERROR、模块名、地址等）
- 多窗口并行调试，各窗口高亮标记互不影响

**一句话描述（可用于 GitHub About）**

> Tabby 串口调试插件：保存 UART 日志到文件，支持 8 色手动关键字高亮（F8 / Shift+F8）。

**推荐 Topics**

`tabby-plugin` `tabby` `uart` `serial` `embedded` `log` `highlight` `terminal`

---

基于 [Eugeny/tabby-save-output](https://github.com/Eugeny/tabby-save-output) fork 并扩展。高亮实现参考 [moemoechu/tabby-highlight](https://github.com/moemoechu/tabby-highlight)。

## 功能

### 日志保存

- 右键 **保存输出到文件...** 手动录制
- 可选自动保存（全部 / 仅 SSH）
- ANSI 处理：`strip`（纯文本）/ `raw`（保留转义序列）
- 默认文件名：`时间戳 - COM口.log`（串口标签使用实际 COM 口名）

### 关键字高亮

- **默认无高亮**，需用户手动标记
- 每个终端窗口独立维护 8 个高亮槽
- 选中文字 → **F8** 标记/取消
- **Shift+F8** 清除当前窗口全部高亮
- 样式：**明亮底色 + 黑字**（荧光笔效果）
- 8 种底色，支持浅色/深色主题自动切换

## 快捷键

| 按键 | 功能 |
|------|------|
| F8 | 对选中文字切换高亮（标记到槽位 / 取消已有标记） |
| Shift+F8 | 清除当前窗口全部高亮 |

可在 Tabby **Settings → Hotkeys** 中修改绑定。

## 安装

### 一键安装（Git Bash，推荐）

先完全退出 Tabby，再在项目根目录执行：

```bash
npm install --legacy-peer-deps --ignore-scripts   # 首次需要
./scripts/install-local.sh
# 或
npm run install:local
```

脚本会构建并将 `package.json` + `dist/index.js` 复制到 `%APPDATA%\tabby\plugins\node_modules\tabby-uart-kit\`（**不需要** `node_modules`）。

### 手动复制

1. `npm run build`
2. 将 `package.json` 和 `dist/` 复制到 Tabby 插件目录下的 `node_modules/tabby-uart-kit/`（Settings → Plugins → Open Plugins Directory）
3. 重启 Tabby

## 配置

设置 → **UART 工具包** / **UART Kit**（随 Tabby 语言自动切换）：

- **Save Log**：自动保存、目录、ANSI 模式
- **Highlight**：8 组 light/dark 底色（默认沿用 highlightwords 配色）

关键字不在 Settings 中预置，仅通过终端选中 + F8 标记。

## License

MIT — 详见 [LICENSE](LICENSE)
