import { defineComponent } from "vue";
import { RouterView } from "vue-router";

import { ConfigProvider } from "@ghcloud/cube-ui";

import "@/assets/style.less";

export const App = defineComponent({
  name: "WorkPermitApp",
  setup: () => () => (
    <ConfigProvider
      prefixCls="ant"
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <RouterView />
    </ConfigProvider>
  ),
});
