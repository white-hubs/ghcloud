import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8888,
      // qiankun 将 Vite 开发态 CSS 注入主应用文档；必须生成绝对资源 URL，
      // 否则 @font-face 的字体会被错误地请求到主应用域名。
      origin: "http://localhost:8888", //本地项目启动若需要查看图标需保证与本地启动端口一致
    },
  };
});
