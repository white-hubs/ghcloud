import { spawn } from "bun";
import { join } from "node:path";

/**
 * 加载 .env 文件并解析环境变量
 */
async function loadEnvFile(envPath: string): Promise<Record<string, string>> {
  try {
    const envFile = await Bun.file(envPath).text();
    const env: Record<string, string> = {};

    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      // 解析 KEY=VALUE 格式
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // 移除可能的引号
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        env[key] = value;
      }
    }

    return env;
  } catch (error) {
    return {};
  }
}

/**
 * Debug 启动脚本，可以直接通过 vscode 调试快捷键快速调试（需要提前安装 bun vscode 插件）
 * 通过 bun 命令运行 main.ts 并传递参数，自动加载 .env 环境变量
 */
async function main() {
  // 加载 .env 文件
  const envPath = join(import.meta.dir, ".env");
  const envVars = await loadEnvFile(envPath);


  // 构建命令行参数
  const args = ["src/main.ts"];

  // 从环境变量构建参数（如果存在）
  const argMapping: Record<string, string> = {
    GITLAB_URL: "--gitlab-url",
    GITLAB_TOKEN: "--gitlab-token",
    GITLAB_WEBHOOK_SECRET: "--gitlab-webhook-secret",
    DINGTALK_WEBHOOK_URL: "--dingtalk-webhook-url",
  };

  for (const [envKey, argKey] of Object.entries(argMapping)) {
    if (envVars[envKey]) {
      args.push(`${argKey}=${envVars[envKey]}`);
    }
  }


  // 合并环境变量：当前进程的环境变量 + .env 文件中的变量
  const fullEnv = {
    ...process.env,
    ...envVars,
  };

  const proc = spawn({
    cmd: ["bun", ...args],
    cwd: import.meta.dir,
    stdio: ["inherit", "inherit", "inherit"],
    env: fullEnv,
  });

  // 处理信号，确保子进程在父进程退出时被终止
  const cleanup = async (signal: string) => {
    try {
      if (proc && !proc.killed) {
        proc.kill();
        // 等待进程退出，最多等待 3 秒
        await Promise.race([proc.exited, new Promise((resolve) => setTimeout(resolve, 3000))]);
      }
    } catch (error) {
    }
    process.exit(0);
  };

  // 注册信号处理器
  process.on("SIGINT", () => cleanup("SIGINT"));
  process.on("SIGTERM", () => cleanup("SIGTERM"));
  process.on("SIGHUP", () => cleanup("SIGHUP"));

  // 等待进程退出
  await proc.exited;
}

main().catch((error) => {
  process.exit(1);
});
