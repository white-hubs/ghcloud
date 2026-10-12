import { defineComponent } from "vue";
import { RouterView } from "vue-router";

import { ConfigProvider } from "@ghcloud/cube-ui";

import "@/assets/style.less";

export const App = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider prefixCls="security-opinion-monitoring">
        <div class="page-route">
          <RouterView />
        </div>
      </ConfigProvider>
    );
  },
});
