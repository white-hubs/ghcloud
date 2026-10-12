import type { VisualProject } from "@ghcloud/cube-service-interface/visualization";

/** 业务配置壳内 Tab */
export const BUSINESS_CONFIG_TABS = [
  { key: "menu", label: "业务菜单" },
  { key: "panel", label: "面板配置" },
  { key: "device", label: "设备关联" },
] as const;

/** 模型配置壳内 Tab */
export const MODEL_CONFIG_TABS = [
  { key: "render", label: "渲染设置" },
  { key: "models", label: "引入模型" },
  { key: "perspective", label: "视角配置" },
  { key: "roaming", label: "漫游路线" },
  { key: "other", label: "其他设置" },
  { key: "guide", label: "导览列表" },
] as const;

export type BusinessConfigTabKey = (typeof BUSINESS_CONFIG_TABS)[number]["key"];
export type ModelConfigTabKey = (typeof MODEL_CONFIG_TABS)[number]["key"];
export type ConfigGroup = "business" | "model";

export const CONFIG_SHELL_PATH: Record<ConfigGroup, string> = {
  business: "/config/business",
  model: "/config/model",
};

export const CONFIG_DEFAULT_TAB: Record<ConfigGroup, string> = {
  business: "menu",
  model: "render",
};

/** 旧扁平路由 → 新壳，保证书签可用 */
export const LEGACY_CONFIG_REDIRECTS = [
  { path: "/business-menu", group: "business" as const, tab: "menu" },
  { path: "/panel-config", group: "business" as const, tab: "panel" },
  { path: "/device-relation", group: "business" as const, tab: "device" },
  { path: "/render-settings", group: "model" as const, tab: "render" },
  { path: "/introducing-models", group: "model" as const, tab: "models" },
  { path: "/perspective-configuration", group: "model" as const, tab: "perspective" },
  { path: "/roaming-route", group: "model" as const, tab: "roaming" },
  { path: "/other-settings", group: "model" as const, tab: "other" },
  { path: "/guide-settings", group: "model" as const, tab: "guide" },
  { path: "/set-screen", group: "model" as const, tab: "guide" },
] as const;

export const DEFAULT_PROJECT_FORM = {
  id: "",
  projectName: "",
  canvas: "16:9",
  mainStructure: "structure-one",
};

export type ProjectFormState = typeof DEFAULT_PROJECT_FORM;

export type ProjectRecord = VisualProject;

/** Cube 可视化预览路径（如 cube-test …/apps/ue5） */
export const UE5_PREVIEW_PATH = "/apps/ue5";

export const buildPreviewLink = (projectId: string): string => `${window.location.origin}${UE5_PREVIEW_PATH}?projectId=${projectId}`;
