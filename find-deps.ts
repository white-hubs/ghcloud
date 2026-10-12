#!/usr/bin/env bun

/**
 * 查找哪个包依赖了指定的包
 * 
 * 用法:
 *   bun find-deps.ts <package-name> [version]
 * 
 * 示例:
 *   bun find-deps.ts "@eslint/js"
 *   bun find-deps.ts "@eslint/js" "9.39.2"
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: any;
}

function findPackageJsonFiles(dir: string, files: string[] = [], includeNodeModules = false): string[] {
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      // 跳过一些不需要的目录（除非明确要求包含 node_modules）
      if (!includeNodeModules && (entry.startsWith(".") || entry === "node_modules")) {
        continue;
      }

      const fullPath = join(dir, entry);
      
      try {
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 对于 node_modules，只扫描第一层
          if (entry === "node_modules" && includeNodeModules) {
            const subEntries = readdirSync(fullPath);
            for (const subEntry of subEntries) {
              const subPath = join(fullPath, subEntry);
              try {
                const subStat = statSync(subPath);
                if (subStat.isDirectory()) {
                  const pkgPath = join(subPath, "package.json");
                  try {
                    statSync(pkgPath);
                    files.push(pkgPath);
                  } catch {
                    // 不是 package.json，继续递归
                    findPackageJsonFiles(subPath, files, true);
                  }
                }
              } catch {
                // 忽略
              }
            }
          } else {
            findPackageJsonFiles(fullPath, files, includeNodeModules);
          }
        } else if (entry === "package.json") {
          files.push(fullPath);
        }
      } catch {
        // 忽略无法访问的文件
      }
    }
  } catch {
    // 忽略无法访问的目录
  }

  return files;
}

function checkDependency(
  pkg: PackageJson,
  depName: string,
  version?: string
): { found: boolean; type: string; version: string } | null {
  const checks = [
    { deps: pkg.dependencies, type: "dependencies" },
    { deps: pkg.devDependencies, type: "devDependencies" },
    { deps: pkg.peerDependencies, type: "peerDependencies" },
    { deps: pkg.optionalDependencies, type: "optionalDependencies" },
  ];

  for (const { deps, type } of checks) {
    if (deps && deps[depName]) {
      const depVersion = deps[depName];
      
      // 如果指定了版本，检查是否匹配
      if (version) {
        // 简单的版本匹配（支持 ^, ~, >= 等）
        if (depVersion.includes(version) || version.includes(depVersion.replace(/[\^~>=<]/g, ""))) {
          return { found: true, type, version: depVersion };
        }
      } else {
        return { found: true, type, version: depVersion };
      }
    }
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    process.exit(0);
  }

  const packageName = args[0];
  const version = args[1];


  // 查找所有 package.json 文件（不包括 node_modules）
  const projectFiles = findPackageJsonFiles(process.cwd(), [], false).filter(
    (file) => !file.includes("/node_modules/") && !file.includes("\\node_modules\\")
  );
  
  // 单独查找 node_modules 中的文件
  const nodeModulesDir = join(process.cwd(), "node_modules");
  const nodeModulesFiles: string[] = [];
  try {
    if (statSync(nodeModulesDir).isDirectory()) {
      findPackageJsonFiles(nodeModulesDir, nodeModulesFiles, true);
    }
  } catch {
    // node_modules 不存在或无法访问
  }


  const results: Array<{
    file: string;
    package: string;
    type: string;
    version: string;
  }> = [];

  for (const file of projectFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      const pkg: PackageJson = JSON.parse(content);
      
      const match = checkDependency(pkg, packageName, version);
      if (match) {
        results.push({
          file: file.replace(process.cwd() + "/", ""),
          package: pkg.name || file,
          type: match.type,
          version: match.version,
        });
      }
    } catch (error) {
      // 忽略解析错误
    }
  }

  if (results.length === 0) {
  } else {
    for (const result of results) {
    }
  }

  // 也检查 node_modules 中的包

  const nodeModulesResults: Array<{
    file: string;
    package: string;
    type: string;
    version: string;
  }> = [];

  for (const file of nodeModulesFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      const pkg: PackageJson = JSON.parse(content);
      
      const match = checkDependency(pkg, packageName, version);
      if (match) {
        // 提取包名（从路径中）
        const pathParts = file.split(/[/\\]/);
        const nodeModulesIndex = pathParts.findIndex((p) => p === "node_modules");
        const packagePath = pathParts.slice(nodeModulesIndex + 1).join("/");
        
        nodeModulesResults.push({
          file: packagePath,
          package: pkg.name || packagePath,
          type: match.type,
          version: match.version,
        });
      }
    } catch (error) {
      // 忽略解析错误
    }
  }

  if (nodeModulesResults.length > 0) {
    for (const result of nodeModulesResults.slice(0, 20)) { // 只显示前20个
    }
    if (nodeModulesResults.length > 20) {
    }
  } else {
  }
}

main().catch((error) => {
  process.exit(1);
});

