import { defineComponent } from "vue";

import { CubeNavBar, EntryMenu } from "@ghcloud/cube-app-generic-component";
import type { AppRoutes } from "@ghcloud/cube-app-generic-component";

import { routes } from "@/router";

import styles from "./entry.module.less";

const entryRoutes = routes
  .filter((route) => route.name != null)
  .map((route) => ({
    ...route,
    name: String(route.name),
  })) as AppRoutes;

export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    document.title = "粮仓管理";
    return () => (
      <>
        <CubeNavBar showBack title="粮仓管理" />
        <main class={styles.container}>
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={entryRoutes} />
          <section class={styles.empty}>
            <div class={styles.emptyTitle}>粮仓管理</div>
            <div class={styles.emptyText}>请选择业务菜单进入页面。</div>
          </section>
        </main>
      </>
    );
  },
});
