import { defineComponent } from "vue";
import { RouterView } from "vue-router";

import { ConfigProvider } from "@ghcloud/cube-ui";

export const App = defineComponent({
  setup: () => (): JSX.Element => (
    <ConfigProvider prefixCls="ai-application">
      <div class="ai-application-app-shell">
        <RouterView />
      </div>
    </ConfigProvider>
  ),
});
