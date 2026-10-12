#!/usr/bin/env bash
# 将 cube-ai-project 的 @cube-ai/* SDK 注册为 bun 全局 link，并在 ghcloud 内 bun install。
#
# 前置：ghcloud 与 cube-ai-project 同级目录，例如：
#   主应用/ghcloud
#   主应用/cube-ai-project
#
# 根 package.json catalogs.cube-ai 使用 link:@cube-ai/<pkg>（须先在本脚本中 bun link 注册）。
#
# 用法（在 ghcloud 根目录）：
#   bun run link:cube-ai
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GHCLOUD_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CUBE_AI_ROOT="$(cd "$GHCLOUD_ROOT/../cube-ai-project" && pwd)"

if [[ ! -f "$CUBE_AI_ROOT/package.json" ]]; then
  echo "error: cube-ai-project not found at $CUBE_AI_ROOT" >&2
  exit 1
fi

# 与根 package.json catalogs.cube-ai 一致（ghcloud 消费的 SDK）
SDK_PATHS=(
  packages/contracts
  packages/agent/sdk-client
  packages/agent/sdk-client-assistant
  packages/agent/sdk-client-vue
  packages/agent/sdk-console
  packages/flow/sdk-client
  packages/flow/sdk-console
  packages/kb/sdk-client
  packages/kb/sdk-console
  packages/llm/sdk-console
)

echo "▶ bun link SDK packages in $CUBE_AI_ROOT"
for rel in "${SDK_PATHS[@]}"; do
  pkg_dir="$CUBE_AI_ROOT/$rel"
  name="$(bun --print "JSON.parse(await Bun.file('$pkg_dir/package.json').text()).name")"
  echo "  • $name  ($rel)"
  (cd "$pkg_dir" && bun link)
done

echo "▶ bun install in ghcloud (catalog:cube-ai uses link:@cube-ai/* after bun link)"
cd "$GHCLOUD_ROOT"
bun install

echo "✓ Local @cube-ai SDK linked. Restart dev server if running."
