# 0001 — Cube 前端子应用工程结构

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: frontend, structure, template

## Context

仓库内存量子应用（`prod/cube/apps/*`）历史跨度长，目录风格并不统一：

- `safety-supervision` 使用 `hook/`（单数），`alarm-center/video-monitor` 使用 `hooks/`
- `api/` 目录混杂 `authStore`、服务实例化、调用封装；新项目已经不推荐
- 部分项目在 `src/` 下直接堆平文件，没有 `views/module/` 分层，规模一大就爆炸

新应用需要一个统一的**工程结构基线**，以便 AI/新成员可以零心智成本接手。

## Decision

所有新子应用按 `prod/cube/template/app` 的目录结构创建：

```
src/
├── app.ts             # Vue + Router + Pinia 装配
├── app.tsx            # 根组件（ConfigProvider）
├── main.ts            # qiankun 生命周期入口
├── logger.ts          # 子 logger
├── assets/            # 全局样式 / 图片
├── constants/         # 环境常量、业务枚举
├── permission/        # 权限码装配
├── router/            # 路由表
├── stores/            # Pinia stores
├── hooks/             # 通用组合式函数（复数形式）
├── mocks/             # 无侵入 fetch mock
└── views/
    ├── <page>/<page>.tsx
    └── module/<module>/<page>.tsx   # 业务模块聚合
```

**硬性约束**：

1. `hooks/` 用复数形式；禁止 `hook/`
2. 不在 `src/` 下新建 `api/` 目录（见 ADR-0003）
3. views 单页文件数超过 3 个的相关页面，必须下沉到 `views/module/<module-name>/`
4. 组件/页面文件用 kebab-case，Vue 组件 `name` 属性用 PascalCase
5. `app.ts` 只负责装配（router/pinia/mount），业务逻辑不许写在里面
6. `main.ts` 只处理 qiankun 生命周期与 `authRequest.updateAuth`；不处理任何业务

## Consequences

### 正面

- 结构一致，AI 和人都能快速定位文件
- `module/` 分层使大型应用演进有章可循
- 去掉 `api/` 层减少中转层和维护成本（见 ADR-0003）

### 负面

- 需要逐步迁移存量项目（不强制，但新功能按此结构）
- `module/<module>` 目录层级加深，浅层页面导入路径稍长

## 参考实现

- `prod/cube/template/app/` — 基础模板
- `prod/cube/apps/video-monitor/app/` — 最接近本规范的存量项目
