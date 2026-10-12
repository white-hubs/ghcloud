// oxlint-disable no-console
import { spawn } from "node:child_process";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { v4 as uuidv4 } from "uuid";

import { getDb } from "../db";
import type { Task, TaskStatus } from "../types";
import { downloadFile } from "../utils/download";
import { extract } from "../utils/extract";
import { transformStaticResources } from "../utils/static-transform";

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");
const GENERATOR_CLI_DIR = process.env.GENERATOR_CLI_DIR || join(process.cwd(), "..", "generator-cli");

function now(): string {
  return new Date().toISOString();
}

export async function createTask(tenantCode: string, downloadStatic = false): Promise<Task> {
  const db = getDb();
  const id = uuidv4();
  const createdAt = now();
  const updatedAt = createdAt;

  db.run(
    `INSERT INTO tasks (id, type, status, tenant_code, download_static, created_at, updated_at)
     VALUES (?, 'build', 'PENDING', ?, ?, ?, ?)`,
    [id, tenantCode, downloadStatic ? 1 : 0, createdAt, updatedAt],
  );

  return { id, type: "build", status: "PENDING", tenantCode, downloadStatic, createdAt, updatedAt };
}

export async function getTask(id: string): Promise<Task | null> {
  const db = getDb();
  const row = db.query("SELECT * FROM tasks WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) {
    return null;
  }
  return {
    id: row.id as string,
    type: row.type as "build",
    status: row.status as TaskStatus,
    outputPath: row.output_path as string | undefined,
    error: row.error as string | undefined,
    tenantCode: row.tenant_code as string,
    downloadStatic: Boolean(row.download_static),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listTasks(status?: TaskStatus, page = 1, pageSize = 20): Promise<{ records: Task[]; total: number }> {
  const db = getDb();
  const offset = (page - 1) * pageSize;

  let query = "SELECT * FROM tasks";
  let countQuery = "SELECT COUNT(*) as count FROM tasks";
  const params: (string | number)[] = [];

  if (status) {
    query += " WHERE status = ?";
    countQuery += " WHERE status = ?";
    params.push(status);
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";

  const total = (db.query(countQuery).get(...params) as { count: number }).count;
  const rows = db.query(query).all(...params, pageSize, offset) as Record<string, unknown>[];

  const records = rows.map((row) => ({
    id: row.id as string,
    type: row.type as "build",
    status: row.status as TaskStatus,
    outputPath: row.output_path as string | undefined,
    error: row.error as string | undefined,
    tenantCode: row.tenant_code as string,
    downloadStatic: Boolean(row.download_static),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));

  return { records, total };
}

export async function updateTaskStatus(id: string, status: TaskStatus, outputPath?: string, error?: string): Promise<void> {
  const db = getDb();
  const updatedAt = now();

  if (outputPath !== undefined) {
    db.run("UPDATE tasks SET status = ?, output_path = ?, error = ?, updated_at = ? WHERE id = ?", [
      status,
      outputPath,
      error || null,
      updatedAt,
      id,
    ]);
  } else {
    db.run("UPDATE tasks SET status = ?, error = ?, updated_at = ? WHERE id = ?", [status, error || null, updatedAt, id]);
  }
}

export async function saveTaskInputFile(id: string, fileName: string, data: ArrayBuffer | ArrayBufferView): Promise<string> {
  const taskDir = join(DATA_DIR, "tasks", id);
  const inputDir = join(taskDir, "input");
  await mkdir(inputDir, { recursive: true });

  const lastIdx = fileName.lastIndexOf(".");
  const secondLastIdx = fileName.lastIndexOf(".", lastIdx - 1);
  let ext = lastIdx > 0 ? fileName.slice(lastIdx) : "";
  if (secondLastIdx > 0 && fileName.slice(secondLastIdx, lastIdx) === ".tar") {
    ext = fileName.slice(secondLastIdx);
  }
  const inputFile = join(inputDir, `input${ext}`);
  await writeFile(inputFile, new Uint8Array(data as ArrayBuffer));
  return inputFile;
}

async function runBuild(id: string, inputDir: string, outputDir: string): Promise<void> {
  console.log(`[task ${id}] ssg build started (input=${inputDir}, output=${outputDir})`);
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ["src/cli.ts", "build", "--input", inputDir, "--output", outputDir], {
      cwd: GENERATOR_CLI_DIR,
      env: { ...process.env, SSG_INPUT_DIR: inputDir },
      stdio: "inherit",
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ssg build failed with code ${code}`));
      }
    });
    child.on("error", reject);
  });

  console.log(`[task ${id}] ssg build completed -> ${outputDir}`);
  await updateTaskStatus(id, "SUCCESS", outputDir);
}

export async function runTask(id: string, excludeHosts: string[] = []): Promise<void> {
  const task = await getTask(id);
  if (!task) {
    throw new Error(`Task ${id} not found`);
  }

  const startTime = Date.now();
  console.log(`[task ${id}] start build from uploaded input (tenant=${task.tenantCode})`);
  await updateTaskStatus(id, "RUNNING");

  const taskDir = join(DATA_DIR, "tasks", id);
  const inputDir = join(taskDir, "input");
  const outputDir = join(taskDir, "output");

  try {
    await mkdir(inputDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    const inputFiles = await getInputFiles(inputDir);
    if (inputFiles.length === 0) {
      throw new Error("No input file found");
    }

    const inputFile = inputFiles[0];
    await extract(inputFile, inputDir);
    console.log(`[task ${id}] extracted input: ${inputFile}`);

    if (task.downloadStatic) {
      console.log(`[task ${id}] transforming static resources (excludeHosts=${excludeHosts.join(",") || "none"})`);
      await transformStaticResources(inputDir, excludeHosts);
    } else {
      console.log(`[task ${id}] skip static download`);
    }

    await runBuild(id, inputDir, outputDir);
    console.log(`[task ${id}] completed in ${Date.now() - startTime}ms`);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const duration = Date.now() - startTime;
    console.error(`[task ${id}] failed after ${duration}ms: ${error}`);
    await updateTaskStatus(id, "FAILED", undefined, error);
    await rm(taskDir, { recursive: true, force: true });
  }
}

export async function runTaskFromUrl(id: string, url: string, excludeHosts: string[] = []): Promise<void> {
  const task = await getTask(id);
  if (!task) {
    throw new Error(`Task ${id} not found`);
  }

  const startTime = Date.now();
  console.log(`[task ${id}] start build from url: ${url} (tenant=${task.tenantCode})`);
  await updateTaskStatus(id, "RUNNING");

  const taskDir = join(DATA_DIR, "tasks", id);
  const inputDir = join(taskDir, "input");
  const outputDir = join(taskDir, "output");

  try {
    await mkdir(inputDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    const urlParts = url.split(".");
    const ext = urlParts.length > 1 ? "." + urlParts.pop()!.split("?")[0] : ".tar.gz";
    const inputFile = join(inputDir, `input${ext}`);
    await downloadFile(url, inputFile);
    console.log(`[task ${id}] downloaded source -> ${inputFile}`);

    const inputFiles = await getInputFiles(inputDir);
    if (inputFiles.length === 0) {
      throw new Error("No input file found after download");
    }

    const downloadedFile = inputFiles[0];
    await extract(downloadedFile, inputDir);
    console.log(`[task ${id}] extracted archive`);

    if (task.downloadStatic) {
      console.log(`[task ${id}] transforming static resources (excludeHosts=${excludeHosts.join(",") || "none"})`);
      await transformStaticResources(inputDir, excludeHosts);
    } else {
      console.log(`[task ${id}] skip static download`);
    }

    await runBuild(id, inputDir, outputDir);
    console.log(`[task ${id}] completed in ${Date.now() - startTime}ms`);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const duration = Date.now() - startTime;
    console.error(`[task ${id}] failed after ${duration}ms: ${error}`);
    await updateTaskStatus(id, "FAILED", undefined, error);
    await rm(taskDir, { recursive: true, force: true });
  }
}

async function getInputFiles(inputDir: string): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  const { stat } = await import("node:fs/promises");
  const files = await readdir(inputDir);
  const result: string[] = [];

  for (const file of files) {
    const filePath = join(inputDir, file);
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) {
      result.push(filePath);
    }
  }

  return result;
}

export async function prepareBusinessDataInput(taskId: string, tenantCode: string): Promise<void> {
  const taskDir = join(DATA_DIR, "tasks", taskId);
  const inputDir = join(taskDir, "input");
  const tempDir = join(taskDir, "temp");

  console.log(`[task ${taskId}] preparing business data input (tenant=${tenantCode})`);

  try {
    // 查找已保存的 zip 文件
    const files = await readdir(inputDir);
    const zipFiles: string[] = [];
    for (const file of files) {
      const filePath = join(inputDir, file);
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) {
        zipFiles.push(filePath);
      }
    }
    if (zipFiles.length === 0) {
      throw new Error("No input file found");
    }

    const zipFile = zipFiles[0];

    await mkdir(tempDir, { recursive: true });
    await extract(zipFile, tempDir);

    const { transformBusinessData } = await import("../utils/business-data-transform");
    await transformBusinessData(tempDir, inputDir, tenantCode);
    console.log(`[task ${taskId}] business data transformed`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function runTaskFromDirectory(id: string, excludeHosts: string[] = []): Promise<void> {
  const task = await getTask(id);
  if (!task) {
    throw new Error(`Task ${id} not found`);
  }

  const startTime = Date.now();
  console.log(`[task ${id}] start build from business data directory (tenant=${task.tenantCode})`);
  await updateTaskStatus(id, "RUNNING");

  const taskDir = join(DATA_DIR, "tasks", id);
  const inputDir = join(taskDir, "input");
  const outputDir = join(taskDir, "output");

  try {
    await mkdir(outputDir, { recursive: true });

    if (task.downloadStatic) {
      console.log(`[task ${id}] transforming static resources (excludeHosts=${excludeHosts.join(",") || "none"})`);
      await transformStaticResources(inputDir, excludeHosts);
    } else {
      console.log(`[task ${id}] skip static download`);
    }

    await runBuild(id, inputDir, outputDir);
    console.log(`[task ${id}] completed in ${Date.now() - startTime}ms`);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const duration = Date.now() - startTime;
    console.error(`[task ${id}] failed after ${duration}ms: ${error}`);
    await updateTaskStatus(id, "FAILED", undefined, error);
    await rm(taskDir, { recursive: true, force: true });
  }
}

export async function deleteTask(id: string): Promise<void> {
  const db = getDb();
  const taskDir = join(DATA_DIR, "tasks", id);
  await rm(taskDir, { recursive: true, force: true });
  db.run("DELETE FROM tasks WHERE id = ?", [id]);
}
