# 更新日志

版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)（SemVer）。

## 1.0.1 — 2026-09-22

### Added

- `scripts/install-local.sh`：Git Bash 一键构建并安装到 Tabby 插件目录
- 界面文案随 Tabby 语言设置自动切换中英文（读取 `config.store.language`，未设置时跟随系统语言）

### Changed

- 界面文案中文化（设置页、右键菜单、快捷键说明、提示信息）
- 移除标签标题栏右键菜单中的高亮状态展示，仅保留日志保存
- F8 / Shift+F8 后回刷终端已有输出，高亮立即作用于 scrollback

### Fixed

- 修复已有日志可高亮但无法取消的问题：维护无高亮的终端快照，回刷时从干净内容重新渲染
- 修复 Tabby 为英文时设置侧栏仍显示「UART 工具包」：等待 `config.ready$` 后再解析语言，并刷新侧栏标题

## 1.0.0 — 2026-09-22

### Added

- 重命名为 `tabby-uart-kit`，模块化目录结构
- 日志保存：ANSI strip/raw、`.log` 后缀、串口 COM 口命名
- 手动关键字高亮：8 槽、每窗口独立、F8 / Shift+F8
- 高亮样式：明亮底色 + 黑字，8 组 light/dark 主题色
- Settings → UART Kit 统一配置页
- 添加 `.cursor/rules` 项目规范（中文交流与版本约定）

### 致谢

- [Eugeny/tabby-save-output](https://github.com/Eugeny/tabby-save-output)
- Highlight approach inspired by [moemoechu/tabby-highlight](https://github.com/moemoechu/tabby-highlight)
