# 🔥 直接用 Alpine 基础镜像（自带 /bin/sh，无报错）
FROM oven/bun:1.3.13-alpine

WORKDIR /app

# Alpine 用 apk 安装依赖（比 apt 更快更小）
RUN apk add --no-cache unzip

# 你的 package.json 保持不变
RUN echo '{"name":"root","private":true,"workspaces":["generator-cli","ssg-components","generator-service"],"catalog":{"@types/node":"22.13.10","typescript":"5.9.3","vue":"3.3.9","vue-tsc":"1.2.0","tailwindcss":"4.3.1","@tailwindcss/postcss":"4.3.1","@tailwindcss/vite":"4.3.1"}}' > package.json

COPY generator-cli ./generator-cli
COPY ssg-components ./ssg-components
COPY generator-service ./generator-service

ENV BUN_CONFIG_REGISTRY=https://registry.npmmirror.com
ENV GENERATOR_CLI_DIR=/app/generator-cli
ENV DATA_DIR=/app/generator-service/data

# 国内镜像加速
RUN bun install --no-progress

EXPOSE 3000

# 启动命令（标准写法）
CMD ["bun", "run", "generator-service/src/index.ts"]