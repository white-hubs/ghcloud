# 流引擎渲染端（PC）

# 待办

# 技术选型

- Render: vue 3.x
- UI: vuetify 3.x
- Codeing: typescript 4.9.x
- Runtime: node 19.x
- Package: pnpm 7.18.x

# 主要文件及目录说明

```
/
|-- .vscode/    // vscode 配置
|-- public/     // 公共资源，public/* 会直接打包到产物中
|-- src/        // 源码目录
| |-- main.ts   // 主入口
| |-- api       // 接口
| |-- assets    //公共资源
| |-- components //组件
| |-- router     //路由
| |-- service    //axios 配置
| |-- store     //pinia 配置



```

# 首次开发

> step 1: 安装依赖

```bash
pnpm install
```

> step 2: 启动开发服务

```bash
pnpm dev
```

> step 3: 构建产物

```bash
pnpm build
```

> step 4: 预览构建产物

```bash
pnpm preview
```
