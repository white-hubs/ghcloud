import { ConfigProvider } from "@ghcloud/cube-ui";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
import "@/assets/style.less";
export const App = defineComponent({
  setup: () => (): JSX.Element => (
    <ConfigProvider prefixCls="alarm-center">
      <RouterView />
    </ConfigProvider>
  ),
});
