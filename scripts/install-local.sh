#!/usr/bin/env bash
# 将 tabby-uart-kit 构建并安装到 Tabby 本地插件目录（Git Bash / WSL）
# 用法：./scripts/install-local.sh
# 安装前请完全退出 Tabby（含托盘图标）

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${APPDATA}/tabby/plugins/node_modules/tabby-uart-kit"

echo "==> 构建插件: $ROOT"
cd "$ROOT"
npm run build

if [[ ! -f dist/index.js ]]; then
    echo "错误: dist/index.js 不存在，构建失败" >&2
    exit 1
fi

echo "==> 安装到: $TARGET"
mkdir -p "$(dirname "$TARGET")"
rm -rf "$TARGET"
mkdir -p "$TARGET/dist"

cp package.json "$TARGET/"
cp dist/index.js "$TARGET/dist/"
if [[ -f dist/index.js.map ]]; then
    cp dist/index.js.map "$TARGET/dist/"
fi

echo "==> 完成"
ls -la "$TARGET/dist/index.js"
echo "请重启 Tabby，在 设置 中查看「UART 工具包」"
