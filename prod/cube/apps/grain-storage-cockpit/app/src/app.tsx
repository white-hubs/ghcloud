import { defineComponent } from "vue";
import { RouterView } from "vue-router";

import { ConfigProvider } from "@ghcloud/cube-ui";

import "@/assets/style.less";

export const App = defineComponent({
  name: "GrainStorageCockpitApp",
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider prefixCls="cube-grain-storage-cockpit-app">
        <RouterView />
      </ConfigProvider>
    );
  },
});
