import type { InjectionKey, Ref } from "vue";

/** 卡片数据是否已加载完成；false 时面板壳会在内容区展示加载动画 */
export const panelCardLoadedKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol("panel-card-loaded");
