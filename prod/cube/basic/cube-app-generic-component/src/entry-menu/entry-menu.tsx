import { Cell, CellGroup } from "vant";
import { defineComponent, onMounted, ref } from "vue";
import { useRouter, type RouteRecordRaw } from "vue-router";

import type { Menu } from "@ghcloud/cube-ouaa-service";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { URLUtils } from "@ghcloud/epp";

import { cubeOuaaService } from "../api/server";

import styles from "./entry-menu.module.less";

export type AppRoutes = (RouteRecordRaw & { getQuery?: () => Promise<Record<string, string>>; name: string })[];

interface Props {
  title?: string;
  applicationCode: string;
  routes: AppRoutes;
}

function urlParamsToObject(url: string): Record<string, string> {
  // 使用正则表达式提取URL中的查询字符串
  const queryString = url.split("?")[1];
  if (!queryString) {
    return {};
  }

  // 将查询字符串分割成键值对
  const params: Record<string, string> = {};
  queryString.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    params[decodeURIComponent(key)] = decodeURIComponent(value || "");
  });

  return params;
}

/** 通用H5 入口页菜单 */
export const EntryMenu = defineComponent({
  props: ["title", "applicationCode", "routes"],
  setup(props: Props) {
    const menu = ref<Menu[]>([]);
    // @ts-ignore
    const router = useRouter() ?? window.__CUBE_H5_VUE_ROUTER__;
    const toItem = async (item: Menu): Promise<void> => {
      const findRoute = props.routes.find((e) => e.path === item.path || item.path.includes(e.name));
      if (findRoute) {
        // 其他应用路由跳转
        const params = findRoute.getQuery ? await findRoute.getQuery() : {};
        if (findRoute.meta?.isOuter) {
          const url = `${findRoute.meta?.outerPath ?? findRoute.path}?${URLUtils.parseToQueryParams(params)}`;
          window.location.href = url;
          return;
        }
        const path = item.path.includes("?") ? item.path.split("?")[0] : item.path;
        const pathParams = urlParamsToObject(item.path);
        router.push({
          path,
          query: {
            ...pathParams,
            ...params,
          },
        });
        return;
      }
      if (item.path.includes("http")) {
        window.location.href = item.path;
      }
    };
    onMounted(() => {
      cubeOuaaService.getAppMenuInfo(props.applicationCode, CubeTerminalEnum.APP).then((res) => {
        menu.value = res;
      });
    });
    return () => {
      return (
        <CellGroup inset class={styles["entry-menu-group"]}>
          <Cell title={props.title ?? "应用"} />
          <div class={styles["entry-menu-list"]}>
            {menu.value.map((item) => {
              return (
                <div
                  class={styles["entry-menu-item"]}
                  key={item.path}
                  onClick={() => {
                    toItem(item);
                  }}
                >
                  <img src={item.icon} />
                  <span>{item.name}</span>
                </div>
              );
            })}
          </div>
        </CellGroup>
      );
    };
  },
});
