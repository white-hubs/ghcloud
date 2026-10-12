// oxlint-disable no-console
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { v4 as uuidv4 } from "uuid";

import { getDb } from "../db";
import { createProvider } from "../providers";
import type { Deploy, DeployStatus, Provider, ProviderConfig } from "../types";

const DATA_DIR = process.env.DATA_DIR || "./data";

function now(): string {
  return new Date().toISOString();
}

export async function createDeploy(
  taskId: string,
  provider: Provider,
  providerConfig: ProviderConfig,
  tenantCode: string,
): Promise<Deploy> {
  const db = getDb();
  const id = uuidv4();
  const createdAt = now();
  const updatedAt = createdAt;

  db.run(
    `INSERT INTO deploys (id, task_id, provider, provider_config, status, progress, tenant_code, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'PENDING', 0, ?, ?, ?)`,
    [id, taskId, provider, JSON.stringify(providerConfig), tenantCode, createdAt, updatedAt],
  );

  return { id, taskId, provider, providerConfig, status: "PENDING", progress: 0, tenantCode, createdAt, updatedAt };
}

export async function getDeploy(id: string): Promise<Deploy | null> {
  const db = getDb();
  const row = db.query("SELECT * FROM deploys WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    provider: row.provider as Provider,
    providerConfig: JSON.parse(row.provider_config as string),
    status: row.status as DeployStatus,
    progress: row.progress as number | undefined,
    output: row.output as string | undefined,
    error: row.error as string | undefined,
    tenantCode: row.tenant_code as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listDeploys(status?: DeployStatus, page = 1, pageSize = 20): Promise<{ records: Deploy[]; total: number }> {
  const db = getDb();
  const offset = (page - 1) * pageSize;

  let query = "SELECT * FROM deploys";
  let countQuery = "SELECT COUNT(*) as count FROM deploys";
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
    taskId: row.task_id as string,
    provider: row.provider as Provider,
    providerConfig: JSON.parse(row.provider_config as string),
    status: row.status as DeployStatus,
    progress: row.progress as number | undefined,
    output: row.output as string | undefined,
    error: row.error as string | undefined,
    tenantCode: row.tenant_code as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));

  return { records, total };
}

export async function updateDeployStatus(id: string, status: DeployStatus, output?: string, error?: string): Promise<void> {
  const db = getDb();
  const updatedAt = now();

  if (output !== undefined) {
    db.run("UPDATE deploys SET status = ?, output = ?, error = ?, updated_at = ? WHERE id = ?", [
      status,
      output,
      error || null,
      updatedAt,
      id,
    ]);
  } else {
    db.run("UPDATE deploys SET status = ?, error = ?, updated_at = ? WHERE id = ?", [status, error || null, updatedAt, id]);
  }
}

export async function updateDeployProgress(id: string, progress: number): Promise<void> {
  const db = getDb();
  const updatedAt = now();
  db.run("UPDATE deploys SET progress = ?, updated_at = ? WHERE id = ?", [progress, updatedAt, id]);
}

export async function runDeploy(id: string): Promise<void> {
  const db = getDb();
  const runningDeploy = db.query("SELECT id FROM deploys WHERE status = 'RUNNING' LIMIT 1").get();
  if (runningDeploy) {
    console.log(`[deploy ${id}] another deploy is running, abort`);
    await updateDeployStatus(id, "FAILED", undefined, "已有部署任务正在执行，请稍后再试");
    return;
  }

  const deploy = await getDeploy(id);
  if (!deploy) throw new Error(`Deploy ${id} not found`);

  const startTime = Date.now();
  console.log(`[deploy ${id}] start (provider=${deploy.provider}, task=${deploy.taskId})`);
  await updateDeployStatus(id, "RUNNING");
  await updateDeployProgress(id, 0);

  const taskDir = join(DATA_DIR, "tasks", deploy.taskId);
  const outputDir = join(taskDir, "output");

  try {
    const { getTask } = await import("./task.service");
    const task = await getTask(deploy.taskId);
    if (!task) {
      const duration = Date.now() - startTime;
      console.error(`[deploy ${id}] task ${deploy.taskId} not found after ${duration}ms`);
      await updateDeployStatus(id, "FAILED", undefined, `Task ${deploy.taskId} not found`);
      return;
    }
    if (task.status !== "SUCCESS") {
      const duration = Date.now() - startTime;
      console.error(`[deploy ${id}] task ${deploy.taskId} not in SUCCESS status after ${duration}ms (current: ${task.status})`);
      await updateDeployStatus(id, "FAILED", undefined, `Task ${deploy.taskId} is not in SUCCESS status (current: ${task.status})`);
      return;
    }

    await mkdir(outputDir, { recursive: true });

    const provider = createProvider(deploy.provider);

    let lastReportedProgress = 0;
    const onProgress = (progress: number) => {
      if (progress - lastReportedProgress >= 5) {
        updateDeployProgress(id, progress).catch(function () {});
        lastReportedProgress = progress;
      }
    };

    console.log(`[deploy ${id}] uploading from ${outputDir} via ${deploy.provider}`);
    const result = await provider.deploy(deploy.providerConfig, outputDir, onProgress);
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log(`[deploy ${id}] success in ${duration}ms -> ${result.output}`);
      await updateDeployProgress(id, 100);
      await updateDeployStatus(id, "SUCCESS", result.output);
    } else {
      console.error(`[deploy ${id}] failed after ${duration}ms: ${result.error}`);
      await updateDeployStatus(id, "FAILED", undefined, result.error);
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const duration = Date.now() - startTime;
    console.error(`[deploy ${id}] error after ${duration}ms: ${error}`);
    await updateDeployStatus(id, "FAILED", undefined, error);
  }
}

export async function deleteDeploy(id: string): Promise<void> {
  const db = getDb();
  db.run("DELETE FROM deploys WHERE id = ?", [id]);
}
