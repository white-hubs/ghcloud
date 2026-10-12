import { ConfigProvider } from "@ghcloud/cube-ui";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
export const App = defineComponent({
  setup: () => (): JSX.Element => (
    <ConfigProvider prefixCls="grid-management">
      <RouterView />
    </ConfigProvider>
  ),
});
