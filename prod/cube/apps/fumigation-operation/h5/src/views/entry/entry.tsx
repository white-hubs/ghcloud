import { defineComponent, type VNode } from "vue";

import { CubeNavBar, EntryMenu, type AppRoutes } from "@ghcloud/cube-app-generic-component";

import { routes } from "@/router";

import styles from "./entry.module.less";

const entryRoutes = routes
  .filter((route) => route.name != null && route.path !== "/entry" && route.path !== "/")
  .map((route) => ({
    ...route,
    name: String(route.name),
  })) as AppRoutes;

export const Entry = defineComponent({
  name: "FumigationOperationH5EntryPage",
  setup: () => {
    document.title = "熏蒸作业";

    return (): VNode => (
      <>
        <CubeNavBar showBack title="熏蒸作业" />
        <main class={styles.container}>
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={entryRoutes} />
        </main>
      </>
    );
  },
});
