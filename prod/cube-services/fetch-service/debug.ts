import { spawn } from "bun";

const env = Bun.env;

function arg(name: string, value: string | undefined): string[] {
  return value && value !== "" ? [`--${name}=${value}`] : [];
}

async function main(): Promise<void> {
  const args = [
    "src/main.ts",
    `--config=${env.APP_CONFIG_PATH ?? "config/app.example.json"}`,
    ...arg("port", env.PORT),
    ...arg("hostname", env.HOSTNAME),
    ...arg("log-level", env.LOG_LEVEL),
    ...arg("fetch-service-token", env.FETCH_SERVICE_TOKEN),
  ];

  const proc = spawn({
    cmd: ["bun", ...args],
    cwd: import.meta.dir,
    stdio: ["inherit", "inherit", "inherit"],
  });

  await proc.exited;
}

main().catch(() => {
  process.exit(1);
});
