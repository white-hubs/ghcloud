#!/usr/bin/env bun

/**
 * 扫描并删除匹配的文件
 * 
 * 用法:
 *   bun remove-files.ts <pattern> [options]
 * 
 * 示例:
 *   bun remove-files.ts "*.log"
 *   bun remove-files.ts "**\/*.tmp" --dry-run
 *   bun remove-files.ts "node_modules" --type dir
 *   bun remove-files.ts "dist" --type dir --exclude "prod/**"
 */

import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, rmdirSync, lstatSync } from "fs";
import { join, relative, dirname } from "path";

interface Options {
  pattern: string;
  type: "file" | "dir" | "both";
  dryRun: boolean;
  exclude: string[];
  include: string[];
  maxDepth?: number;
  force: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    process.exit(0);
  }

  const pattern = args[0];
  let type: "file" | "dir" | "both" = "both";
  let dryRun = false;
  const exclude: string[] = [];
  const include: string[] = [];
  let maxDepth: number | undefined;
  let force = false;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === "--type" || arg === "-t") {
      if (nextArg && ["file", "dir", "both"].includes(nextArg)) {
        type = nextArg as "file" | "dir" | "both";
        i++;
      } else {
        process.exit(1);
      }
    } else if (arg === "--exclude" || arg === "-e") {
      if (nextArg) {
        exclude.push(nextArg);
        i++;
      } else {
        process.exit(1);
      }
    } else if (arg === "--include" || arg === "-i") {
      if (nextArg) {
        include.push(nextArg);
        i++;
      } else {
        process.exit(1);
      }
    } else if (arg === "--max-depth" || arg === "-d") {
      if (nextArg) {
        const depth = parseInt(nextArg, 10);
        if (isNaN(depth) || depth < 0) {
          process.exit(1);
        }
        maxDepth = depth;
        i++;
      } else {
        process.exit(1);
      }
    } else if (arg === "--force" || arg === "-f") {
      force = true;
    } else if (arg === "--dry-run" || arg === "-n") {
      dryRun = true;
    }
  }

  if (!pattern) {
    process.exit(1);
  }

  return { pattern, type, dryRun, exclude, include, maxDepth, force };
}

/**
 * 简单的 glob 模式匹配
 * 支持: *, **, ?, [abc]
 */
function globToRegex(pattern: string): RegExp {
  // 转义特殊字符，但保留 glob 特殊字符
  let regex = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "___DOUBLE_STAR___")
    .replace(/\*/g, "[^/]*")
    .replace(/___DOUBLE_STAR___/g, ".*")
    .replace(/\?/g, "[^/]")
    .replace(/\[([^\]]+)\]/g, "[$1]"); // 字符类

  return new RegExp(`^${regex}$`);
}

function matchesPattern(path: string, pattern: string, baseDir: string): boolean {
  const relativePath = relative(baseDir, path);
  const normalizedPath = relativePath.replace(/\\/g, "/"); // 统一使用正斜杠
  
  try {
    const regex = globToRegex(pattern);
    return regex.test(normalizedPath) || regex.test(path.replace(/\\/g, "/"));
  } catch {
    // 如果正则表达式有问题，使用简单的字符串匹配
    return normalizedPath.includes(pattern) || path.includes(pattern);
  }
}

function shouldExclude(path: string, excludePatterns: string[], includePatterns: string[], baseDir: string): boolean {
  // 先检查包含模式（优先级更高）
  if (includePatterns.length > 0) {
    const included = includePatterns.some(pattern => matchesPattern(path, pattern, baseDir));
    if (!included) {
      return true; // 如果指定了包含模式但不匹配，则排除
    }
  }

  // 检查排除模式
  return excludePatterns.some(pattern => matchesPattern(path, pattern, baseDir));
}

function findMatchingFiles(
  dir: string,
  pattern: string,
  options: Options,
  baseDir: string = dir,
  currentDepth: number = 0
): string[] {
  const files: string[] = [];
  const ignoreDirs = new Set(["node_modules", ".git", ".svn", ".hg"]);

  // 检查深度限制
  if (options.maxDepth !== undefined && currentDepth > options.maxDepth) {
    return files;
  }

  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      
      try {
        // 检查是否应该排除
        if (shouldExclude(fullPath, options.exclude, options.include, baseDir)) {
          continue;
        }

        const stat = lstatSync(fullPath);
        const isDir = stat.isDirectory();
        const isFile = stat.isFile();
        const isSymlink = stat.isSymbolicLink();

        // 跳过符号链接
        if (isSymlink) {
          continue;
        }

        // 检查是否匹配模式
        const matches = matchesPattern(fullPath, pattern, baseDir) || 
                       matchesPattern(entry, pattern, baseDir);

        if (matches) {
          if ((options.type === "file" || options.type === "both") && isFile) {
            files.push(fullPath);
          } else if ((options.type === "dir" || options.type === "both") && isDir) {
            files.push(fullPath);
          }
        }

        // 递归遍历目录
        if (isDir && !ignoreDirs.has(entry)) {
          const subFiles = findMatchingFiles(fullPath, pattern, options, baseDir, currentDepth + 1);
          files.push(...subFiles);
        }
      } catch (err) {
        // 忽略无法访问的文件/目录
        continue;
      }
    }
  } catch (err) {
    // 忽略无法访问的目录
  }

  return files;
}

function getFileSize(path: string): number {
  try {
    const stat = statSync(path);
    return stat.size;
  } catch {
    return 0;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function deleteFile(path: string): boolean {
  try {
    const stat = lstatSync(path);
    if (stat.isDirectory()) {
      // 先删除目录内容
      const entries = readdirSync(path);
      for (const entry of entries) {
        deleteFile(join(path, entry));
      }
      rmdirSync(path);
    } else {
      unlinkSync(path);
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const options = parseArgs();
  const baseDir = process.cwd();

  if (options.exclude.length > 0) {
  }
  if (options.include.length > 0) {
  }
  if (options.maxDepth !== undefined) {
  }
  if (options.dryRun) {
  }

  const matchingFiles = findMatchingFiles(baseDir, options.pattern, options, baseDir);

  if (matchingFiles.length === 0) {
    return;
  }


  let totalSize = 0;
  const filesByType = { files: 0, dirs: 0 };

  for (const filePath of matchingFiles) {
    const relativePath = relative(baseDir, filePath);
    try {
      const stat = lstatSync(filePath);
      const isDir = stat.isDirectory();
      const size = isDir ? 0 : getFileSize(filePath);
      totalSize += size;
      
      if (isDir) {
        filesByType.dirs++;
      } else {
        filesByType.files++;
      }
    } catch (err) {
    }
  }


  if (options.dryRun) {
    return;
  }

  // 确认删除
  if (!options.force) {
    return;
  }


  let deletedCount = 0;
  let failedCount = 0;

  // 按深度排序，先删除深层文件，再删除浅层目录
  const sortedFiles = matchingFiles.sort((a, b) => {
    const depthA = a.split("/").length;
    const depthB = b.split("/").length;
    return depthB - depthA; // 深度大的先删除
  });

  for (const filePath of sortedFiles) {
    const relativePath = relative(baseDir, filePath);
    try {
      if (deleteFile(filePath)) {
        deletedCount++;
      } else {
        failedCount++;
      }
    } catch (error) {
      failedCount++;
    }
  }

  if (failedCount === 0) {
  } else {
  }
}

main().catch((error) => {
  process.exit(1);
});

