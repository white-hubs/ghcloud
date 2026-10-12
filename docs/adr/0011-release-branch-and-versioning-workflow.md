# 0011 — Release 分支集成、版本校验与 Hotfix 工作流

- **Status**: accepted
- **Date**: 2026-06-15
- **Tags**: release, versioning, branch, hotfix, ci

## Context

原模型是**主干开发**：变更直接合 `main`，version gate 在**每次 push** 都 hard 校验（本地 `pre-push-check.ts` 无条件跑 `runVersionGate` + CI）。在以下并行场景下产生版本冲突：

- 正在进行的**大迭代**（大量需求，多个包要升级）
- 现场**紧急 hotfix**
- 插队的**快速正式需求**（要赶在本次迭代前上线）

仓库现状约束（决定了方案边界）：

- 包管理是 **bun workspace**，CI 在 **GitLab**，发布是**手动 `bun publish` 到 Nexus 私有源**。
- **每个包版本号独立**，且 `package.json.version` 就是**上传的制品版本**——这是一个真相源。
- **git tag 是另一个真相源**（标识"哪一轮 release / 第几次 hotfix"）。两者**并存且都重要**（与"不关注子模块版本"的 bazel 仓不同）。
- `@changesets/cli` 已安装但**未接入**；无自动化 release pipeline。

本 ADR 是一个**临时但自洽**的过渡方案。环境晋升（alpha/beta/rc + dist-tag 通道）、全自动发布、changesets 接入**本轮不做**。

## Decision

### A. 分支模型

- `main`：主干，永远稳定可用。
- 新轮次从 `main` 拉 **`release-*` 集成分支**；本轮所有变更经 MR 合入 release。
- **feature → release 用 rebase**（短命分支，保持线性历史）。
- **release → main 用 rebase + fast-forward**（统一 rebase）。
- **并行允许**：可同时存在多条 `release-*`。**先到先得**——谁先合 `main` 谁赢；**后到者必须 rebase 到最新 `main`，重新定版本号、重打 tag**。

### B. Tag

- 仓库级 tag，命名 **`tag-{release_branch_name}`**。
- 在 **MR→main 合并后由 CI 立即自动打**，使用 `CI_MERGE_REQUEST_SOURCE_BRANCH_NAME` 拿到 release 分支名（rebase+FF 后 `main` 无 merge commit，源分支名只能从 MR 元数据取）。不靠人工记忆。

### C. 版本校验矩阵

| 场景 | 在哪 | 检查 | 硬/软 | 跳过方式 |
|---|---|---|---|---|
| feature / 开发分支 push | 本地 pre-push | 否 | — | — |
| `release-*` / `main` 分支 push | 本地 pre-push | 是 | **hard** | `SKIP_VERSION_CHECK=1 git push` |
| MR target = `main` | GitLab CI | 是 | **hard，且 `current` 必须 semver 严格大于 `base`** | 仅已有 skip commit（trailer）可豁免 |
| MR target = `release-*` | GitLab CI | 是 | warn（仅判"变了没"） | — |
| 其它 target 的 MR | GitLab CI | 否 | — | — |

- 去掉本地**无条件** version gate：`pre-push-check.ts` 仅当前分支匹配 `release-*` 或 `main` 时才跑版本检查（build / lint / 依赖 gate 不变）。
- 并行模式下，main 的判定从"`current !== base`"升级为"**`current` 严格大于 `base`**"，以拦截后到者 rebase 后忘记重定版导致的降级。

### D. Hotfix

- 现场问题**必须从历史 release tag** `{origin_release_tag}` checkout。
- **hotfix tag**：`{origin_release_tag}-hotfix.{n}`，`{n}` = 该 release tag 被 hotfix 的第几次（per-release 计数）。
- **hotfix 包版本**：`{该包在 origin tag 时的版本}-hotfix.{m}`，base 用**原号不 +1**（现场是 `1.1.1` 则 `1.1.1-hotfix.m`）；`{m}` = **每包独立**的 hotfix 计数（与 tag 的 `n` 不要求相等）。
- hotfix 制品**手动推到部署容器**；pre-main 阶段版本号不被 CI gate。
- **hotfix 不直接合 `main`**：修复通过 **cherry-pick 前向带入当前 release 和 main**（维护线 + forward port），保证后续版本不丢该修复。

### E. 本轮范围外

- **不做**环境晋升（alpha/beta/rc）与 dist-tag 环境通道；开发 / 测试**手动选择发包**。
- **不引入** changesets / 全自动发布 pipeline。

## Consequences

### 正面

- 并行迭代 / hotfix / 插队需求都有明确落位；版本冲突由 **先到先得 + rebase + 严格大于校验** 三重兜底。
- 开发期不被版本 gate 打扰；强制点收敛到 `release-*` / `main` push 与 MR→main。
- tag 自动化，与 main 历史精确对应（合并后即时打）。
- 制品号（package version）与 release 快照（tag）两个真相源都被保留。

### 负面

- 并行 release 的 rebase 成本高：后到者要重定版、重打 tag、解冲突。
- hotfix 版本 `x.y.z-hotfix.n` 在 semver 里是 `x.y.z` 的**预发布**，**优先级低于 `x.y.z`**，且默认不被 `^`/`workspace:^` 解析；**仅因"手动推容器、无依赖解析"才安全**。若未来引入自动依赖解析或 dist-tag 发布，此格式会踩坑（届时应改 patch 抬升或 build metadata，需新 ADR supersede）。
- pre-main 版本号不强管 → 制品号正确性靠人，只有到 `release-*` / `main` 才有保障。
- 无环境晋升 → 环境区分依赖"推哪个容器"的人工纪律。
- 两套跳过机制（本地 `SKIP_VERSION_CHECK` env + CI skip commit trailer）需文档说明，避免混用。

### 实现指引（落地时）

- `.ci/pre-push-check.ts`：`runVersionGate` 改为仅 `release-*` / `main` 分支触发；读 `SKIP_VERSION_CHECK` env 作本地逃生口。
- `.ci/check-version.ts`：读 `CI_MERGE_REQUEST_TARGET_BRANCH_NAME` 分流 hard/warn；其它 target 跳过。
- `.ci/local-ci-core.ts`：版本判定补 semver 比较（`current > base`），用于 main hard 检查。
- `.gitlab-ci.yaml`：MR→main job 增加合并后自动打 `tag-{source_branch}` 的步骤。

> 关联：依赖版本策略见 [0002](./0002-package-version-strategy.md)（catalog / workspace:^）；本 ADR 只覆盖 release 分支、tag、`package.json.version` 与 hotfix。
