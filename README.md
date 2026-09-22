# UART Kit for Tabby

串口 / UART 调试终端工具插件：日志保存 + 手动关键字高亮。

基于 [Eugeny/tabby-save-output](https://github.com/Eugeny/tabby-save-output) fork 并扩展。高亮实现参考 [moemoechu/tabby-highlight](https://github.com/moemoechu/tabby-highlight)。

## 功能

### 日志保存

- 右键 **Save output to file...** 手动录制
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

### 插件目录

1. `npm install && npm run build`
2. 将本目录复制到 Tabby 插件目录（Settings → Plugins → Open Plugins Directory）
3. 重启 Tabby

### 环境变量

```powershell
$env:TABBY_PLUGINS="d:\path\to\tabby-uart-kit"
tabby --debug
```

## 配置

Settings → **UART Kit**：

- **Save Log**：自动保存、目录、ANSI 模式
- **Highlight**：8 组 light/dark 底色（默认沿用 highlightwords 配色）

关键字不在 Settings 中预置，仅通过终端选中 + F8 标记。

## License

MIT — 详见 [LICENSE](LICENSE)
