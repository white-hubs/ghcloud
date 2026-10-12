# government-management

人事管理

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
| |--   common //公共组件 
| |--    flowTable 通用流程类页面
| |--    statisticsTable 统计表格页面
| |-- views
| |--- Appraise //考核申请
| |--- charts // 图标类组件页面
| |--- Depart // 离职申请
| |--- Drill  // 培训申请
| |--- Induction  // 入职申请
| |--- Recruit  // 离职申请
| |--- Regular  // 转正申请
| |--- statisticsInfo // 统计详情类页面
| |--- WorkShift  // 轮岗申请
| |--- flowConfig  // 流程配置
| |--- overView  // 员工概况
| |--- personnelStatistics  // 人员异动统计
| |--- posiManage  // 职位管理
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
