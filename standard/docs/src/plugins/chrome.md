# 🌐 插件背景
为了解决以下开发痛点：
- 本地服务启动缓慢
- 前后端联调效率低下
- 线上问题排查困难

古河云研发团队推出基于 Chromium 的浏览器扩展插件，兼容：
- Chrome ≥ 89
- Edge ≥ 91
- 360极速浏览器 ≥ 13.5
- QQ浏览器 ≥ 10.6


## 🛠️ 核心功能

| 功能模块 | 能力描述 | 技术实现 |
|---------|---------|---------|
| **微应用配置** | 动态修改主应用注册配置 | 拦截 `config.js` 请求并重写响应 |
| **请求代理** | 注入 `Backend-ip` 头参数 | 通过 `webRequest` API 修改请求头 |

## 📥 安装指南
::: tip 🚀 快速开始
需具备源码仓库访问权限（联系管理员申请）
:::

```bash
# 克隆仓库
git clone http://git.guhecloud.com:8000/ghcloud/ghcloud-chrome-plugin.git
```

1. 打开浏览器扩展页面：
   - Chrome: 访问 `chrome://extensions`
   - Edge: 访问 `edge://extensions`
2. 启用 **开发者模式** 🔧
3. 点击 <kbd>加载已解压的扩展程序</kbd>
4. 选择克隆的仓库目录

![安装示意图](/images/install-chrome-plugin.png)

## 🖼️ 功能演示
![插件界面](/images/chrome-plugin.png)
<div class="img-caption">图1: 插件主界面 - 配置微应用和请求代理</div>

## 🧭 使用说明
### 微应用配置
1. 选择需要劫持的微应用请求
1. 在输入框填写本地服务地址（示例：`http://localhost:8888`）
3. 点击 <button style="background:#16baaa;color:white;padding:5px 10px;border-radius:4px">应用</button>

### 请求代理
1. 在 Header 注入面板输入目标 IP
2. 点击 <button style="background:#16baaa;color:white;padding:5px 10px;border-radius:4px">应用</button>


## 🚧 开发路线
```roadmap
- Q3 2025
  - [ ] 子应用命名自定义
  - [ ] Header 规则引擎
- Q4 2025
  - [ ] 跨域请求白名单
  - [ ] 代理历史记录
```