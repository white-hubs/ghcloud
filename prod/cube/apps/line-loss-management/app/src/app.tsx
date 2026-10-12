import { ConfigProvider } from "@ghcloud/cube-ui";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
export const App = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider prefixCls="line-loss-management">
        <RouterView />
      </ConfigProvider>
    );
  },
});
