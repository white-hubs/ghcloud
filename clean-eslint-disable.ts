#!/usr/bin/env bun

/**
 * 清理代码文件中所有 eslint-disable 相关的注释
 *
 * 功能：
 * 1. 移除所有 eslint-disable、eslint-disable-next-line、eslint-disable-line 等注释
 * 2. 移除所有 eslint-enable 注释
 * 3. 支持 TypeScript、JavaScript、Vue 等文件
 *
 * 用法:
 *   bun clean-eslint-disable.ts [文件路径...] [options]
 *
 * 示例:
 *   bun clean-eslint-disable.ts                                    # 自动查找所有相关文件
 *   bun clean-eslint-disable.ts src/index.ts                      # 清理指定文件
 *   bun clean-eslint-disable.ts --dry-run                          # 预览模式，不实际修改
 *   bun clean-eslint-disable.ts --help                             # 显示帮助信息
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, relative, extname } from "path";

interface CleanResult {
  file: string;
  cleaned: boolean;
  removedComments: number;
}

interface Options {
  dryRun: boolean;
  files: string[];
  extensions: string[];
}

// 支持的文件扩展名
const DEFAULT_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".vue", ".mjs", ".cjs"];

/**
 * 解析命令行参数
 */
function parseArgs(): Options {
  const args = process.argv.slice(2);

  // 检查帮助选项
  if (args.includes("--help") || args.includes("-h")) {
    process.exit(0);
  }

  let dryRun = false;
  const files: string[] = [];
  const extensions: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === "--dry-run" || arg === "-n") {
      dryRun = true;
    } else if (arg === "--ext" || arg === "-e") {
      if (nextArg && !nextArg.startsWith("--") && !nextArg.startsWith("-")) {
        extensions.push(nextArg);
        i++;
      } else {
        process.exit(1);
      }
    } else if (!arg.startsWith("--") && !arg.startsWith("-")) {
      // 不是选项，视为文件路径
      files.push(arg);
    } else {
      process.exit(1);
    }
  }

  return {
    dryRun,
    files,
    extensions: extensions.length > 0 ? extensions : DEFAULT_EXTENSIONS,
  };
}

/**
 * 清理单个文件中的 eslint-disable 相关注释
 */
async function cleanFile(filePath: string, dryRun: boolean = false): Promise<CleanResult> {
  const content = await readFile(filePath, "utf-8");
  let cleaned = false;
  let removedComments = 0;
  let newContent = content;

  // 包括：

  // 使用逐行处理的方式，更精确地匹配
  const lines = newContent.split("\n");
  const cleanedLines: string[] = [];
  let inBlockComment = false;
  let blockCommentStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 检查是否是 eslint 相关的单行注释
    if (trimmedLine.startsWith("//") && trimmedLine.includes("eslint-")) {
      // 跳过这一行
      removedComments++;
      cleaned = true;
      continue;
    }

    // 检查是否是 eslint 相关的块注释开始
    if (trimmedLine.startsWith("/*") && trimmedLine.includes("eslint-")) {
      // 检查是否在同一行结束
      if (trimmedLine.includes("*/")) {
        // 单行块注释，跳过
        removedComments++;
        cleaned = true;
        continue;
      } else {
        // 多行块注释开始
        inBlockComment = true;
        blockCommentStart = i;
        removedComments++;
        cleaned = true;
        continue;
      }
    }

    // 如果在块注释中
    if (inBlockComment) {
      // 检查是否结束
      if (trimmedLine.includes("*/")) {
        inBlockComment = false;
        blockCommentStart = -1;
        continue;
      }
      // 块注释中间的行，跳过
      continue;
    }

    // 正常行，保留
    cleanedLines.push(line);
  }

  newContent = cleanedLines.join("\n");

  // 额外处理：匹配可能遗漏的块注释（跨行的情况）
  const blockPattern = /\/\*\s*eslint-(?:disable|enable|disable-next-line|disable-line|disable-block)[\s\S]*?\*\/\s*\n?/g;
  const blockMatches = newContent.match(blockPattern);
  if (blockMatches) {
    newContent = newContent.replace(blockPattern, "");
    removedComments += blockMatches.length;
    cleaned = true;
  }

  // 清理可能的空行（连续两个空行变为一个）
  newContent = newContent.replace(/\n{3,}/g, "\n\n");

  // 清理文件开头的空行
  newContent = newContent.replace(/^\n+/, "");

  // 如果文件被修改，写入新内容（除非是预览模式）
  if (cleaned && newContent !== content) {
    if (!dryRun) {
      await writeFile(filePath, newContent, "utf-8");
    }
  }

  return {
    file: filePath,
    cleaned,
    removedComments,
  };
}

/**
 * 递归查找所有代码文件
 */
async function findCodeFiles(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // 跳过 node_modules 和 dist 目录
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
          continue;
        }
        // 递归查找子目录
        const subFiles = await findCodeFiles(fullPath, extensions);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        // 检查文件扩展名是否匹配
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // 忽略权限错误等
    if (error instanceof Error && !error.message.includes("ENOENT")) {
    }
  }

  return files;
}

/**
 * 主函数
 */
async function main() {
  const options = parseArgs();
  const cwd = process.cwd();

  let filesToClean: string[] = [];

  if (options.files.length > 0) {
    // 如果提供了文件路径，使用提供的路径
    filesToClean = options.files.map((arg) => {
      if (arg.startsWith("/")) {
        return arg;
      }
      return join(cwd, arg);
    });
  } else {
    // 否则递归查找所有代码文件
    filesToClean = await findCodeFiles(cwd, options.extensions);
  }

  if (filesToClean.length === 0) {
    return;
  }

  if (options.dryRun) {
  } else {
  }

  const results: CleanResult[] = [];

  for (const file of filesToClean) {
    try {
      const result = await cleanFile(file, options.dryRun);
      results.push(result);

      const relativePath = relative(cwd, file);

      if (result.cleaned) {
        const prefix = options.dryRun ? "🔍" : "✓";
      } else {
      }
    } catch (error) {
      const relativePath = relative(cwd, file);
    }
  }

  const cleanedCount = results.filter((r) => r.cleaned).length;
  const totalComments = results.reduce((sum, r) => sum + r.removedComments, 0);

  if (options.dryRun) {
  } else {
  }
}

// 运行主函数
main().catch((function(){}));
