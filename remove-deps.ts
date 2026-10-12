#!/usr/bin/env bun

/**
 * 从所有子项目的 package.json 中删除指定的依赖
 * 
 * 用法:
 *   bun remove-deps.ts <package-name> [options]
 * 
 * 示例:
 *   bun remove-deps.ts lodash
 *   bun remove-deps.ts lodash axios --dev
 *   bun remove-deps.ts lodash axios --deps
 *   bun remove-deps.ts lodash --dry-run
 */

import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: any;
}

interface Options {
  packages: string[];
  devOnly: boolean;
  depsOnly: boolean;
  dryRun: boolean;
  excludeRoot: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    process.exit(0);
  }

  const packages: string[] = [];
  let devOnly = false;
  let depsOnly = false;
  let dryRun = false;
  let excludeRoot = false;

  for (const arg of args) {
    if (arg === "--dev" || arg === "-d") {
      devOnly = true;
    } else if (arg === "--deps" || arg === "-D") {
      depsOnly = true;
    } else if (arg === "--dry-run" || arg === "-n") {
      dryRun = true;
    } else if (arg === "--exclude-root" || arg === "-r") {
      excludeRoot = true;
    } else if (!arg.startsWith("--") && !arg.startsWith("-")) {
      packages.push(arg);
    }
  }

  if (packages.length === 0) {
    process.exit(1);
  }

  if (devOnly && depsOnly) {
    process.exit(1);
  }

  return { packages, devOnly, depsOnly, dryRun, excludeRoot };
}

function findPackageJsonFiles(excludeRoot: boolean): string[] {
  const rootPackageJson = join(process.cwd(), "package.json");
  const files: string[] = [];
  const ignoreDirs = new Set(["node_modules", "dist", "build", ".git"]);

  function traverseDir(dir: string) {
    try {
      const entries = readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        
        try {
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            // 跳过忽略的目录
            if (!ignoreDirs.has(entry)) {
              traverseDir(fullPath);
            }
          } else if (entry === "package.json") {
            files.push(fullPath);
          }
        } catch (err) {
          // 忽略无法访问的文件/目录
          continue;
        }
      }
    } catch (err) {
      // 忽略无法访问的目录
    }
  }

  traverseDir(process.cwd());

  if (excludeRoot) {
    return files.filter((file) => file !== rootPackageJson);
  }

  return files;
}

function removeDependencies(
  packageJson: PackageJson,
  packages: string[],
  options: Options
): { modified: boolean; removed: { deps: string[]; devDeps: string[] } } {
  const removed = { deps: [] as string[], devDeps: [] as string[] };
  let modified = false;

  // 处理 dependencies
  if (!options.devOnly && packageJson.dependencies) {
    for (const pkg of packages) {
      if (packageJson.dependencies[pkg]) {
        removed.deps.push(pkg);
        delete packageJson.dependencies[pkg];
        modified = true;
      }
    }
    // 如果 dependencies 为空，删除该字段
    if (Object.keys(packageJson.dependencies).length === 0) {
      delete packageJson.dependencies;
    }
  }

  // 处理 devDependencies
  if (!options.depsOnly && packageJson.devDependencies) {
    for (const pkg of packages) {
      if (packageJson.devDependencies[pkg]) {
        removed.devDeps.push(pkg);
        delete packageJson.devDependencies[pkg];
        modified = true;
      }
    }
    // 如果 devDependencies 为空，删除该字段
    if (Object.keys(packageJson.devDependencies).length === 0) {
      delete packageJson.devDependencies;
    }
  }

  // 可选：也处理 peerDependencies 和 optionalDependencies
  if (!options.devOnly && packageJson.peerDependencies) {
    for (const pkg of packages) {
      if (packageJson.peerDependencies[pkg]) {
        removed.deps.push(pkg);
        delete packageJson.peerDependencies[pkg];
        modified = true;
      }
    }
    if (Object.keys(packageJson.peerDependencies).length === 0) {
      delete packageJson.peerDependencies;
    }
  }

  if (!options.devOnly && packageJson.optionalDependencies) {
    for (const pkg of packages) {
      if (packageJson.optionalDependencies[pkg]) {
        removed.deps.push(pkg);
        delete packageJson.optionalDependencies[pkg];
        modified = true;
      }
    }
    if (Object.keys(packageJson.optionalDependencies).length === 0) {
      delete packageJson.optionalDependencies;
    }
  }

  return { modified, removed };
}

function formatRemovedInfo(removed: { deps: string[]; devDeps: string[] }): string {
  const parts: string[] = [];
  if (removed.deps.length > 0) {
    parts.push(`dependencies: ${removed.deps.join(", ")}`);
  }
  if (removed.devDeps.length > 0) {
    parts.push(`devDependencies: ${removed.devDeps.join(", ")}`);
  }
  return parts.length > 0 ? ` (${parts.join("; ")})` : "";
}

async function main() {
  const options = parseArgs();
  const packageJsonFiles = findPackageJsonFiles(options.excludeRoot);

  if (options.devOnly) {
  } else if (options.depsOnly) {
  } else {
  }
  if (options.dryRun) {
  }

  let totalModified = 0;
  let totalRemoved = 0;

  for (const filePath of packageJsonFiles) {
    try {
      const content = readFileSync(filePath, "utf-8");
      const packageJson: PackageJson = JSON.parse(content);
      const { modified, removed } = removeDependencies(packageJson, options.packages, options);

      if (modified) {
        totalModified++;
        const removedCount = removed.deps.length + removed.devDeps.length;
        totalRemoved += removedCount;

        const relativePath = filePath.replace(process.cwd() + "/", "");
        const packageName = packageJson.name || relativePath;
        const removedInfo = formatRemovedInfo(removed);


        if (!options.dryRun) {
          const newContent = JSON.stringify(packageJson, null, 2) + "\n";
          writeFileSync(filePath, newContent, "utf-8");
        }
      }
    } catch (error) {
      const relativePath = filePath.replace(process.cwd() + "/", "");
    }
  }

  if (options.dryRun) {
  } else {
  }
}

main().catch((error) => {
  process.exit(1);
});

