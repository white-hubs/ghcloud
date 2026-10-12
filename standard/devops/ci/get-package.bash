#!/bin/bash
# 获取包指定属性 `bash get-package.bash ${packageName} ${property}`
# 可用属性：[name: 包名] [version: 包版本] [path: 包绝对路径] [private: 包私有性]

GET_PACKAGE="
const results = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf-8')).filter(r => r.name === '$1').map((r) => r.$2);
if (results.length === 1) {
  process.stdout.write(String(results[0]))
}
else {
  throw new Error('cannot find module \'$1\'')
}
"

pnpm m ls --json --depth=-1 | node -e "$GET_PACKAGE"