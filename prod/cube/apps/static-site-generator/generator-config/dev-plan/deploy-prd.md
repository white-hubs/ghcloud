# 网站发布 PRD

---

## 1. 需求概述

网站发布用于配置部署目标、执行构建和部署操作，并展示制品列表。

---

## 2. 路由设计

| 路由 | 说明 |
|------|------|
| `/deploy/config` | 网站发布配置 |
| `/deploy/run` | 网站发布 |

---

## 3. 页面说明

### 3.1 发布配置页面 (`/deploy/config`)

- **部署目标**：Select 选择
  - 七牛云
  - SFTP（选中提示"暂时不支持"）
  - FTP（选中提示"暂时不支持"）
- **保存配置按钮**

### 3.2 发布执行页面 (`/deploy/run`)

- **发布按钮**：点击调用构建服务

- **制品列表**
  | 列 | 说明 |
  |--|--|
  | 制品名 | product-{timestamp} |
  | 构建状态 | PENDING / RUNNING / SUCCESS / FAILED |
  | 发布状态 | PENDING / RUNNING / SUCCESS / FAILED |
  | 最近发布成功时间 | - |
  | 操作 | 再次发布 |

- **再次发布**：行操作按钮，点击重新执行构建和部署

---

## 4. 数据模型

### 4.1 构建任务 (Task)

```typescript
interface Task {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  outputPath?: string;
  error?: string;
  createdTime: string;
  updatedTime: string;
}
```

### 4.2 部署任务 (Deploy)

```typescript
interface Deploy {
  id: string;
  taskId: string;
  provider: 'qiniu' | 'ftp' | 'sftp';
  providerConfig: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  output?: string;
  error?: string;
  createdTime: string;
  updatedTime: string;
}
```

### 4.3 制品 (Artifact)

```typescript
interface Artifact {
  id: string;
  artifactName: string;      // 制品名，格式：product-{timestamp}
  taskStatus: TaskStatus;    // 构建状态
  deployStatus: DeployStatus; // 发布状态
  lastDeployTime?: string;    // 最近发布成功时间
}
```

---

## 5. API 设计

### 5.1 部署配置

| 接口 | 方法 | 说明 |
|------|------|------|
| `/deploy/config/get` | GET | 获取部署配置 |
| `/deploy/config/save` | POST | 保存部署配置 |

### 5.2 构建与发布

| 接口 | 方法 | 说明 |
|------|------|------|
| `/deploy/run` | POST | 执行构建和部署 |
| `/deploy/artifact/list` | GET | 获取制品列表 |

### 5.3 制品操作

| 接口 | 方法 | 说明 |
|------|------|------|
| `/deploy/artifact/redeploy` | POST | 再次发布 |

---

## 6. 注意事项

> ⚠️ 选择 SFTP/FTP 时，页面提示"暂时不支持"
> ⚠️ 制品名格式为 product-{timestamp}，timestamp 为时间戳
> ⚠️ 构建状态和发布状态枚举：PENDING / RUNNING / SUCCESS / FAILED