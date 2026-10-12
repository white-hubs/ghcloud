import { type Component, defineAsyncComponent } from "vue";

export const zhongda_heshun_cards: Record<string, Component> = {
  //  总览
  "zd-sanitize-items": defineAsyncComponent(async () => (await import("./overview/zd-sanitize-items/zd-sanitize-items")).ZDSanitizeItems), // 消杀项目
  "zd-project-area": defineAsyncComponent(async () => (await import("./overview/zd-project-area/zd-project-area")).ZDProjectArea), // 项目区域分布
  "zd-project-cycle": defineAsyncComponent(async () => (await import("./overview/zd-project-cycle/zd-project-cycle")).ZDProjectCycle), // 项目周期占比
  "zd-key-place": defineAsyncComponent(async () => (await import("./overview/zd-key-place/zd-key-place")).ZDKeyPlace), // 重点场所
  "zd-project-person": defineAsyncComponent(async () => (await import("./overview/zd-project-person/zd-project-person")).ZDProjectPerson), // 项目人员
  // 消杀项目
  "xsk-project-list": defineAsyncComponent(async () => (await import("./sanitize-items/xsk-project-list/xsk-project-list")).XSKProjectList), // 项目列表
  "xsk-project-key-place": defineAsyncComponent(
    async () => (await import("./sanitize-items/xsk-project-key-place/xsk-project-key-place")).XSKProjectKeyPlace,
  ), // 项目重点场所
  "xsk-project-task": defineAsyncComponent(async () => (await import("./sanitize-items/xsk-project-task/xsk-project-task")).XSKProjectTask), // 项目任务
  "xsk-project-person": defineAsyncComponent(
    async () => (await import("./sanitize-items/xsk-project-person/xsk-project-person")).XSKProjectPerson,
  ), // 项目人员
  // 项目人员
  "xsk-project-statistics": defineAsyncComponent(
    async () => (await import("./project-person/xsk-project-statistics/xsk-project-statistics")).XSKProjectStatistics,
  ), // 项目统计
  "xsk-person-post-distribution": defineAsyncComponent(
    async () => (await import("./project-person/xsk-person-post-distribution/xsk-person-post-distribution")).XSKPersonPostDistribution,
  ), // 项目岗位分布
  "xsk-person-task-completion-number": defineAsyncComponent(
    async () =>
      (await import("./project-person/xsk-person-task-completion-number/xsk-person-task-completion-number")).XSKPersonTaskCompletionNumber,
  ), // 项目人员任务完成数
  "xsk-person-list": defineAsyncComponent(async () => (await import("./project-person/xsk-person-list/xsk-person-list")).XSKPersonList), // 项目人员列表
  // 重点场所
  "xsk-key-place-statistics": defineAsyncComponent(
    async () => (await import("./key-place/xsk-key-place-statistics/xsk-key-place-statistics")).XSKKeyPlaceStatistics,
  ), // 重点场所-重点统计
  "xsk-key-place-percentage": defineAsyncComponent(
    async () => (await import("./key-place/xsk-key-place-percentage/xsk-key-place-percentage")).XSKKeyPlacePercentage,
  ), // 重点场所-重点场所占比
  "xsk-key-place-distribution": defineAsyncComponent(
    async () => (await import("./key-place/xsk-key-place-distribution/xsk-key-place-distribution")).XSKKeyPlaceDistribution,
  ), // 重点场所-重点场所分布
  "xsk-key-place-list": defineAsyncComponent(
    async () => (await import("./key-place/xsk-key-place-list/xsk-key-place-list")).XSKKeyPlaceList,
  ), // 重点场所-重点场所列表
  // 产品
  "xsk-project-product-statistics": defineAsyncComponent(
    async () =>
      (await import("./project-product/xsk-project-product-statistics/xsk-project-product-statistics")).XSKProjectProductStatistics,
  ), // 产品-产品统计
  "xsk-project-product-distribution": defineAsyncComponent(
    async () =>
      (await import("./project-product/xsk-project-product-distribution/xsk-project-product-distribution")).XSKProjectProductDistribution,
  ), //产品-产品数分布
  "xsk-project-product-user-distribution": defineAsyncComponent(
    async () =>
      (await import("./project-product/xsk-project-product-user-distribution/xsk-project-product-user-distribution"))
        .XSKProjectProductUserDistribution,
  ), //产品-产品用户数分布
  "xsk-project-product-trends": defineAsyncComponent(
    async () => import("./project-product/xsk-project-product-trends/xsk-project-product-trends"),
  ), //产品-产品新增趋势
  "xsk-project-product-user-trends": defineAsyncComponent(
    async () => import("./project-product/xsk-project-product-user-trends/xsk-project-product-user-trends"),
  ), //产品-用户新增趋势
  "xsk-project-product-rank": defineAsyncComponent(
    async () => (await import("./project-product/xsk-project-product-rank/xsk-project-product-rank")).XSKProjectProductRank,
  ), //产品-产品增量排名
};
