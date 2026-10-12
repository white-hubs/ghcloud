# 表单审核（微前端）

- **qiankun 子应用名**：`cube-form-audit-app`（与 `vite.config.ts` 中 `vite-plugin-qiankun` 一致）
- **独立运行入口**：`#cube-form-audit-app`
- **微前端 base**：`/portal/form-audit`（见 `src/main.ts` 中 `appBasePath`）
- **npm 包名**：`@ghcloud/cube-form-audit-app`

门户需在微前端注册表中增加子应用入口，指向构建产物（`PUBLIC_PATH` 见各环境 `.env`）。应用编码可与权限约定一致使用 `FORM_AUDIT`（见 `cube-permission-codes`）。
