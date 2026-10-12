# template

冷冻水

# 待办

# 技术选型

- Render: vue 3.x
- UI: antd 3.x
- Codeing: typescript 4.9.x
- Runtime: node 19.x
- Package: pnpm 7.x

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

# 注

`package.json` 中，`@vue/runtime-core` 依赖是为了解决 `pnpm` 软链暂时不被 `tsc` 支持导致编译类型错误问题。详情参考：[Typescript#42873](https://github.com/microsoft/TypeScript/issues/42873) [Typescript#29221](https://github.com/microsoft/TypeScript/issues/29221) [Typescript#1375](https://github.com/pnpm/pnpm/issues/1375) [vitejs#9348](https://github.com/vitejs/vite/issues/9348)
