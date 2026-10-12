import { defineComponent, type VNode } from "vue";

import { CubeNavBar, EntryMenu, type AppRoutes } from "@ghcloud/cube-app-generic-component";

import { routes } from "@/router";

import "./entry.less";

const entryRoutes = routes
  .filter((route) => route.name != null && route.path !== "/entry" && route.path !== "/auth/login")
  .map((route) => ({
    ...route,
    name: String(route.name),
  })) as AppRoutes;

export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    document.title = "安全信用";

    return (): VNode => (
      <>
        <CubeNavBar showBack title="安全信用" />
        <main class="safety-credit-entry">
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={entryRoutes} />
        </main>
      </>
    );
  },
});
