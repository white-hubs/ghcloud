import groupControl from "@/views/GroupControl/index.vue";
import TimeControl from "@/views/TimeControl/index.vue";
import groupControlHandle from "@/views/GroupControl/Details/index.vue";
import timeControlHandle from "@/views/LightingTime/Details/index.vue";
import lightingGroup from "@/views/LightingGroup/index.vue";
import lightingTime from "@/views/LightingTime/index.vue";
/** 固定的路由 */
export const constantRoutes: AuthRoute.Route[] = [
  {
    path: "/groupControl",
    name: "groupControl",
    component: groupControl,
  },
  {
    path: "/timeControl",
    name: "timeControl",
    component: TimeControl,
  },
  {
    path: "/groupControlHandle",
    name: "groupControlHandle",
    component: groupControlHandle,
  },
  {
    path: "/timeControlHandle",
    name: "timeControlHandle",
    component: timeControlHandle,
  },
  {
    path: "/lightingGroup",
    name: "lightingGroup",
    component: lightingGroup,
  },
  {
    path: "/lightingTime",
    name: "lightingTime",
    component: lightingTime,
  },
];
