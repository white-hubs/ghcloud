# cube-h5-gen-streamEngine
流引擎 H5 渲染能力

# 待办
- [*] 动态表单
- [ ] 流程引擎 doing...

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

# CD
[dev](http://192.168.0.220:8090/job/bimops(dev)/job/bimops-fe-streamengine-h5/)