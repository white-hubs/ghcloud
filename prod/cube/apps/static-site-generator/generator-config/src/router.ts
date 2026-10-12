import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  // 站点设置
  {
    path: "/site-setting",
    name: "SiteSetting",
    meta: {
      title: "站点设置",
    },
    component: async () => (await import("./views/site-setting/site-setting")).SiteSetting,
  },
  // 素材管理
  {
    path: "/material-management",
    name: "MaterialManagement",
    meta: {
      title: "素材管理",
    },
    component: async () => (await import("./views/material-management/material-management")).MaterialManagement,
  },
  // 页面管理列表
  {
    path: "/page-management/list",
    name: "PageManagementList",
    meta: {
      title: "页面管理列表",
    },
    component: async () => (await import("./views/page-management/page-management-list/page-management-list")).PageManagementList,
  },
  // 页面管理布局列表
  {
    path: "/page-management/layout-list",
    name: "PageManagementLayoutList",
    meta: {
      title: "页面管理布局列表",
    },
    component: async () =>
      (await import("./views/page-management/page-management-layout-list/page-management-layout-list")).PageManagementLayoutList,
  },
  // 页面布局设计
  {
    path: "/page-management/layout-design",
    name: "PageManagementLayoutDesign",
    meta: {
      title: "页面布局设计",
    },
    component: async () =>
      (await import("./views/page-management/page-management-layout-design/page-management-layout-design")).PageManagementLayoutDesign,
  },
  // 页面内容编辑
  {
    path: "/page-management/design",
    name: "PageManagementDesign",
    meta: {
      title: "页面内容编辑",
    },
    component: async () => (await import("./views/page-management/page-management-design/page-management-design")).PageManagementDesign,
  },
  // 文章管理列表
  {
    path: "/article-management/list",
    name: "ArticleManagementList",
    meta: {
      title: "文章管理列表",
    },
    component: async () =>
      (await import("./views/article-management/article-management-list/article-management-list")).ArticleManagementList,
  },
  // 文章管理分类
  {
    path: "/article-management/category",
    name: "ArticleManagementCategory",
    meta: {
      title: "文章管理分类",
    },
    component: async () =>
      (await import("./views/article-management/article-management-category/article-management-category")).ArticleManagementCategory,
  },
  // 文章内容编辑
  {
    path: "/article-management/content",
    name: "ArticleManagementContent",
    meta: {
      title: "文章内容编辑",
    },
    component: async () =>
      (await import("./views/article-management/article-management-content/article-management-content")).ArticleManagementContent,
  },
  // 咨询列表
  {
    path: "/consultation",
    name: "ConsultationList",
    meta: {
      title: "咨询列表",
    },
    component: async () => (await import("./views/consultation/consultation-list/consultation-list")).ConsultationList,
  },
  // 部署配置
  {
    path: "/deploy/config",
    name: "DeployConfig",
    meta: {
      title: "部署配置",
    },
    component: async () => (await import("./views/deploy/deploy-config/deploy-config")).DeployConfig,
  },
  // 构建部署
  {
    path: "/deploy/run",
    name: "DeployRun",
    meta: {
      title: "构建部署",
    },
    component: async () => (await import("./views/deploy/deploy-run/deploy-run")).DeployRun,
  },
  // 站点预览（通配符路由，映射到构建后的任意页面路径）
  {
    path: "/site-preview/:path(.*)*",
    name: "SitePreview",
    meta: {
      title: "站点预览",
    },
    component: async () => (await import("./views/site-preview/site-preview")).SitePreview,
  },
];
