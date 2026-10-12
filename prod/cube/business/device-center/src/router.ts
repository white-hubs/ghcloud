import { deviceAnalysis } from "./router/device-analysis";
import { deviceHealthAlarmRoutes } from "./router/device-health-alarm";
import { deviceManage } from "./router/device-manage";
import { deviceNoticeRoutes } from "./router/device-notice";
import { deviceStatistic } from "./router/device-statistic";
import { productManage } from "./router/product-manage";
import { tagManage } from "./router/tag-manage";
import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "productList",
  },
  ...deviceManage,
  ...productManage,
  ...deviceStatistic,
  ...deviceHealthAlarmRoutes,
  ...deviceAnalysis,
  ...tagManage,
  ...deviceNoticeRoutes,
];
