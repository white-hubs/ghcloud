import { defineComponent, type VNode } from "vue";

import { CubeNavBar, EntryMenu, type AppRoutes } from "@ghcloud/cube-app-generic-component";

import { routes } from "@/router";

const entryRoutes = routes
  .filter((route) => route.name != null && route.path !== "/auth/login" && route.path !== "/entry" && route.path !== "/monitoring/detail")
  .map((route) => ({
    ...route,
    name: String(route.name),
  })) as AppRoutes;

export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    document.title = "冷库管理";

    return (): VNode => (
      <>
        <CubeNavBar showBack title="冷库管理" />
        <main class="cs-h5-page cs-entry-page">
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={entryRoutes} />
        </main>
      </>
    );
  },
});
