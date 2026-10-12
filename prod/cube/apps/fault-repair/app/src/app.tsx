import { ConfigProvider } from "@ghcloud/cube-ui";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
export const App = defineComponent({
  setup: () => {
    return () => (
      <ConfigProvider prefixCls="cube-fault-repair-app">
        <RouterView />
      </ConfigProvider>
    );
  },
});
