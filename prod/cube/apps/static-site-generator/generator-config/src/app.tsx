import "./tailwind.css";
import { ConfigProvider } from "@ghcloud/cube-ui";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
export const App = defineComponent({
  setup: () => (): JSX.Element => (
    <ConfigProvider prefixCls="static-site-generator">
      <RouterView />
    </ConfigProvider>
  ),
});
