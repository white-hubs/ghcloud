#!/usr/bin/env bun

/**
 * 递归删除 node_modules 或 dist 文件夹
 * 
 * 用法:
 *   bun clean-dirs.ts [node_modules|dist|both] [options]
 * 
 * 示例:
 *   bun clean-dirs.ts node_modules
 *   bun clean-dirs.ts dist --dry-run
 *   bun clean-dirs.ts both --force
 */

import { existsSync, readdirSync, statSync, rmdirSync, unlinkSync, lstatSync } from "fs";
import { join, relative } from "path";

type TargetType = "node_modules" | "dist" | "both";

interface Options {
  target: TargetType;
  dryRun: boolean;
  force: boolean;
  exclude: string[];
  include: string[];
  maxDepth?: number;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    process.exit(0);
  }

  let target: TargetType = "both";
  let dryRun = false;
  const exclude: string[] = [];
  const include: string[] = [];
  let maxDepth: number | undefined;
  let force = false;

  // 第一个参数可能是目标类型
  if (args[0] && !args[0].startsWith("--") && !args[0].startsWith("-")) {
    const firstArg = args[0].toLowerCase();
    if (firstArg === "node_modules" || firstArg === "dist" || firstArg === "both") {
      target = firstArg as TargetType;
      args.shift();
    }
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === "--exclude" || arg === "-e") {
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

  return { target, dryRun, force, exclude, include, maxDepth };
}

function globToRegex(pattern: string): RegExp {
  let regex = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "___DOUBLE_STAR___")
    .replace(/\*/g, "[^/]*")
    .replace(/___DOUBLE_STAR___/g, ".*")
    .replace(/\?/g, "[^/]")
    .replace(/\[([^\]]+)\]/g, "[$1]");

  return new RegExp(`^${regex}$`);
}

function matchesPattern(path: string, pattern: string, baseDir: string): boolean {
  const relativePath = relative(baseDir, path);
  const normalizedPath = relativePath.replace(/\\/g, "/");
  
  try {
    const regex = globToRegex(pattern);
    return regex.test(normalizedPath) || regex.test(path.replace(/\\/g, "/"));
  } catch {
    return normalizedPath.includes(pattern) || path.includes(pattern);
  }
}

function shouldExclude(path: string, excludePatterns: string[], includePatterns: string[], baseDir: string): boolean {
  if (includePatterns.length > 0) {
    const included = includePatterns.some(pattern => matchesPattern(path, pattern, baseDir));
    if (!included) {
      return true;
    }
  }

  return excludePatterns.some(pattern => matchesPattern(path, pattern, baseDir));
}

function findTargetDirs(
  dir: string,
  targetNames: string[],
  options: Options,
  baseDir: string = dir,
  currentDepth: number = 0
): string[] {
  const dirs: string[] = [];
  const ignoreDirs = new Set([".git", ".svn", ".hg"]);

  if (options.maxDepth !== undefined && currentDepth > options.maxDepth) {
    return dirs;
  }

  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      
      try {
        if (shouldExclude(fullPath, options.exclude, options.include, baseDir)) {
          continue;
        }

        const stat = lstatSync(fullPath);
        
        if (stat.isDirectory() && !stat.isSymbolicLink()) {
          // 检查是否是目标目录
          if (targetNames.includes(entry)) {
            dirs.push(fullPath);
          } else if (!ignoreDirs.has(entry)) {
            // 递归查找
            const subDirs = findTargetDirs(fullPath, targetNames, options, baseDir, currentDepth + 1);
            dirs.push(...subDirs);
          }
        }
      } catch (err) {
        // 忽略无法访问的文件/目录
        continue;
      }
    }
  } catch (err) {
    // 忽略无法访问的目录
  }

  return dirs;
}

function getDirSize(path: string): number {
  let size = 0;
  
  try {
    const entries = readdirSync(path);
    
    for (const entry of entries) {
      const fullPath = join(path, entry);
      try {
        const stat = lstatSync(fullPath);
        
        if (stat.isDirectory() && !stat.isSymbolicLink()) {
          size += getDirSize(fullPath);
        } else if (stat.isFile()) {
          size += stat.size;
        }
      } catch {
        // 忽略无法访问的文件
      }
    }
  } catch {
    // 忽略无法访问的目录
  }
  
  return size;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function deleteDir(path: string): boolean {
  try {
    const entries = readdirSync(path);
    
    for (const entry of entries) {
      const fullPath = join(path, entry);
      try {
        const stat = lstatSync(fullPath);
        
        if (stat.isDirectory() && !stat.isSymbolicLink()) {
          deleteDir(fullPath);
        } else {
          unlinkSync(fullPath);
        }
      } catch (err) {
        // 忽略无法删除的文件
      }
    }
    
    rmdirSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const options = parseArgs();
  const baseDir = process.cwd();

  const targetNames: string[] = [];
  if (options.target === "node_modules" || options.target === "both") {
    targetNames.push("node_modules");
  }
  if (options.target === "dist" || options.target === "both") {
    targetNames.push("dist");
  }

  if (options.exclude.length > 0) {
  }
  if (options.include.length > 0) {
  }
  if (options.maxDepth !== undefined) {
  }
  if (options.dryRun) {
  }

  const targetDirs = findTargetDirs(baseDir, targetNames, options, baseDir);

  if (targetDirs.length === 0) {
    return;
  }


  let totalSize = 0;
  const dirsByType: Record<string, number> = {};

  for (const dirPath of targetDirs) {
    const relativePath = relative(baseDir, dirPath);
    const dirName = dirPath.split(/[/\\]/).pop() || "";
    
    if (!dirsByType[dirName]) {
      dirsByType[dirName] = 0;
    }
    dirsByType[dirName]++;

    try {
      const size = getDirSize(dirPath);
      totalSize += size;
    } catch (err) {
    }
  }

  const typeSummary = Object.entries(dirsByType)
    .map(([name, count]) => `${name}: ${count}`)
    .join(", ");

  if (options.dryRun) {
    return;
  }

  // 确认删除
  if (!options.force) {
    return;
  }


  let deletedCount = 0;
  let failedCount = 0;

  // 按深度排序，先删除深层目录
  const sortedDirs = targetDirs.sort((a, b) => {
    const depthA = a.split(/[/\\]/).length;
    const depthB = b.split(/[/\\]/).length;
    return depthB - depthA;
  });

  for (const dirPath of sortedDirs) {
    const relativePath = relative(baseDir, dirPath);
    try {
      if (deleteDir(dirPath)) {
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

