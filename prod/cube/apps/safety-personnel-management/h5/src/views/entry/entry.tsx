import { defineComponent, type VNode } from "vue";

import { CubeNavBar, EntryMenu, type AppRoutes } from "@ghcloud/cube-app-generic-component";

import { routes } from "@/router";

import styles from "./entry.module.less";

const entryRoutes = routes
  .filter((route) => route.name != null && route.path !== "/entry")
  .map((route) => ({
    ...route,
    name: String(route.name),
  })) as AppRoutes;

export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    document.title = "安全人员管理";
    return (): VNode => (
      <>
        <CubeNavBar showBack title="安全人员管理" />
        <div class={styles.container}>
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={entryRoutes} />
        </div>
      </>
    );
  },
});
