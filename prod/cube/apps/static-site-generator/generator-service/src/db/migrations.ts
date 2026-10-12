export const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'build',
    status TEXT NOT NULL DEFAULT 'PENDING',
    output_path TEXT,
    error TEXT,
    tenant_code TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at)`,
  `CREATE TABLE IF NOT EXISTS deploys (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_config TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    progress INTEGER DEFAULT 0,
    output TEXT,
    error TEXT,
    tenant_code TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_deploys_task_id ON deploys(task_id)`,
  `CREATE INDEX IF NOT EXISTS idx_deploys_status ON deploys(status)`,
  `ALTER TABLE tasks ADD COLUMN download_static INTEGER NOT NULL DEFAULT 0`,
];
